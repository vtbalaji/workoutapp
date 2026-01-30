const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './new-exercise-v3';

// Extract exercise slugs from complete_new.html
function extractSlugsFromFile(filePath) {
    const html = fs.readFileSync(filePath, 'utf8');
    const regex = /href="https?:\/\/workoutlabs\.com\/exercise-guide\/([^/"]+)\/?"/g;
    const slugs = new Set();
    let match;
    while ((match = regex.exec(html)) !== null) {
        if (match[1] && match[1] !== '') {
            slugs.add(match[1]);
        }
    }
    return Array.from(slugs);
}

// Fetch URL content
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        }, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                fetchUrl(response.headers.location).then(resolve).catch(reject);
                return;
            }
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => resolve(data));
        });
        request.on('error', reject);
        request.setTimeout(30000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Extract related exercises with their animation URLs from a page
function extractRelatedExercises(html) {
    const exercises = [];
    
    // Pattern: <a href="...exercise-guide/SLUG/" ... data-id="..."> ... <div class="exAnim" data-murl="..." data-furl="...">
    const linkPattern = /<a\s+href="https?:\/\/workoutlabs\.com\/exercise-guide\/([^"\/]+)\/?"\s+class="[^"]*exWrp[^"]*hasAnim[^"]*"[^>]*>[\s\S]*?<div\s+class="exAnim[^"]*"\s+data-murl="([^"]+)"\s+data-furl="([^"]+)"[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g;
    
    let match;
    while ((match = linkPattern.exec(html)) !== null) {
        exercises.push({
            slug: match[1],
            maleUrl: match[2],
            femaleUrl: match[3],
            title: match[4].trim()
        });
    }
    
    return exercises;
}

// Download and save SVG
async function downloadSvg(url, filepath) {
    const svg = await fetchUrl(url);
    fs.writeFileSync(filepath, svg);
    return svg.length;
}

// Fetch full metadata from exercise's own page
async function fetchExerciseMetadata(slug) {
    const html = await fetchUrl(`https://workoutlabs.com/exercise-guide/${slug}/`);
    
    const result = {
        description: '',
        equipment: [],
        primary_muscles: [],
        secondary_muscles: [],
        related_exercises: []
    };

    // Extract description from meta
    const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
    if (descMatch) result.description = descMatch[1].split('. Follow the Pin')[0];

    // Extract equipment
    const equipMatch = html.match(/Equipment required<\/div>\s*<div[^>]*>\s*<a[^>]*>([^<]+)<\/a>/i);
    if (equipMatch) result.equipment = [equipMatch[1].trim()];

    // Extract primary muscles from image filenames
    const primaryRegex = /muscle-groups\/([a-z-]+)-p\.png/g;
    let match;
    while ((match = primaryRegex.exec(html)) !== null) {
        const muscle = match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        if (!result.primary_muscles.includes(muscle)) {
            result.primary_muscles.push(muscle);
        }
    }

    // Extract secondary muscles from image filenames
    const secondaryRegex = /muscle-groups\/([a-z-]+)-s\.png/g;
    while ((match = secondaryRegex.exec(html)) !== null) {
        const muscle = match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        if (!result.secondary_muscles.includes(muscle)) {
            result.secondary_muscles.push(muscle);
        }
    }

    // Extract related exercises
    const relatedRegex = /<a[^>]*href="[^"]*\/exercise-guide\/([^"\/]+)\/?\"[^>]*class="[^"]*exWrp[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g;
    while ((match = relatedRegex.exec(html)) !== null) {
        const relatedTitle = match[2].trim();
        if (!result.related_exercises.includes(relatedTitle)) {
            result.related_exercises.push(relatedTitle);
        }
    }

    return result;
}

// Process exercises found on a page
async function processFoundExercises(exercises, stats) {
    for (const ex of exercises) {
        const exerciseDir = path.join(OUTPUT_DIR, ex.slug);
        
        // Skip if already downloaded
        if (fs.existsSync(path.join(exerciseDir, 'male.svg'))) {
            continue;
        }
        
        console.log(`  -> Downloading ${ex.slug} (${ex.title})`);
        
        try {
            // Create directory
            if (!fs.existsSync(exerciseDir)) {
                fs.mkdirSync(exerciseDir, { recursive: true });
            }
            
            // Download SVGs
            await downloadSvg(ex.maleUrl, path.join(exerciseDir, 'male.svg'));
            await downloadSvg(ex.femaleUrl, path.join(exerciseDir, 'female.svg'));
            
            // Fetch full metadata from exercise's own page
            const metadata = await fetchExerciseMetadata(ex.slug);
            
            // Save metadata
            const workoutJson = {
                id: ex.maleUrl.match(/id=(\d+)/)?.[1] || '',
                slug: ex.slug,
                title: ex.title,
                description: metadata.description,
                equipment: metadata.equipment,
                primary_muscles: metadata.primary_muscles,
                secondary_muscles: metadata.secondary_muscles,
                related_exercises: metadata.related_exercises,
                images: {
                    male: ex.maleUrl.replace('&a=1', ''),
                    female: ex.femaleUrl.replace('&a=1', '')
                }
            };
            fs.writeFileSync(
                path.join(exerciseDir, 'workout.json'),
                JSON.stringify(workoutJson, null, 2)
            );
            
            stats.downloaded++;
            
            // Small delay
            await new Promise(r => setTimeout(r, 300));
            
        } catch (error) {
            console.log(`     ERROR: ${error.message}`);
            stats.errors++;
        }
    }
}

// Main function
async function main() {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Get starting slugs
    const slugs = extractSlugsFromFile('./complete_new.html');
    console.log(`Found ${slugs.length} exercise pages to crawl\n`);

    const stats = { pages: 0, downloaded: 0, skipped: 0, errors: 0 };
    const visited = new Set();

    for (let i = 0; i < slugs.length; i++) {
        const slug = slugs[i];
        
        if (visited.has(slug)) continue;
        visited.add(slug);
        
        console.log(`[${i + 1}/${slugs.length}] Crawling ${slug}...`);
        stats.pages++;

        try {
            const pageUrl = `https://workoutlabs.com/exercise-guide/${slug}/`;
            const html = await fetchUrl(pageUrl);
            
            // Extract related exercises with animation URLs
            const relatedExercises = extractRelatedExercises(html);
            
            if (relatedExercises.length > 0) {
                console.log(`  Found ${relatedExercises.length} related exercises with animations`);
                await processFoundExercises(relatedExercises, stats);
            }
            
            // Small delay between pages
            await new Promise(r => setTimeout(r, 500));
            
        } catch (error) {
            console.log(`  ERROR: ${error.message}`);
            stats.errors++;
        }
    }

    console.log('\n=== Download Complete ===');
    console.log(`Pages crawled: ${stats.pages}`);
    console.log(`Exercises downloaded: ${stats.downloaded}`);
    console.log(`Errors: ${stats.errors}`);
}

main().catch(console.error);
