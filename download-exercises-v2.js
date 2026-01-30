const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './new-exercise';

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

// Parse exercise page to extract metadata and SVG URLs
function parseExercisePage(html, slug) {
    const result = {
        slug,
        title: '',
        description: '',
        equipment: [],
        primary_muscles: [],
        secondary_muscles: [],
        related_exercises: [],
        images: { male: '', female: '' }
    };

    // Extract title
    const titleMatch = html.match(/<title>([^–<]+)/);
    if (titleMatch) result.title = titleMatch[1].trim();

    // Extract description from meta
    const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
    if (descMatch) result.description = descMatch[1].split('. Follow the Pin')[0];

    // Extract SVG URLs from data-url_male/data-url_female (correct exercise)
    // Add &a=1 to get animation frames
    const maleMatch = html.match(/data-url_male="([^"]+)"/);
    const femaleMatch = html.match(/data-url_female="([^"]+)"/);
    if (maleMatch) {
        result.images.male = maleMatch[1] + (maleMatch[1].includes('&a=1') ? '' : '&a=1');
    }
    if (femaleMatch) {
        result.images.female = femaleMatch[1] + (femaleMatch[1].includes('&a=1') ? '' : '&a=1');
    }

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
    const relatedRegex = /class="relatedExLink"[^>]*>([^<]+)<\/a>/g;
    while ((match = relatedRegex.exec(html)) !== null) {
        if (!result.related_exercises.includes(match[1])) {
            result.related_exercises.push(match[1]);
        }
    }

    return result;
}

// Download and save SVG
async function downloadSvg(url, filepath) {
    const svg = await fetchUrl(url);
    fs.writeFileSync(filepath, svg);
    return svg.length;
}

// Process single exercise
async function processExercise(slug, index, total) {
    const exerciseDir = path.join(OUTPUT_DIR, slug);
    
    // Skip if already downloaded
    if (fs.existsSync(path.join(exerciseDir, 'workout.json')) && 
        fs.existsSync(path.join(exerciseDir, 'male.svg')) &&
        fs.existsSync(path.join(exerciseDir, 'female.svg'))) {
        console.log(`[${index}/${total}] Skipping ${slug} (already exists)`);
        return { slug, status: 'skipped' };
    }

    console.log(`[${index}/${total}] Processing ${slug}...`);

    try {
        // Fetch exercise page
        const pageUrl = `https://workoutlabs.com/exercise-guide/${slug}/`;
        const html = await fetchUrl(pageUrl);

        // Parse metadata
        const metadata = parseExercisePage(html, slug);

        if (!metadata.images.male || !metadata.images.female) {
            console.log(`  WARNING: Missing SVG URLs for ${slug}`);
            return { slug, status: 'missing_urls' };
        }

        // Create directory
        if (!fs.existsSync(exerciseDir)) {
            fs.mkdirSync(exerciseDir, { recursive: true });
        }

        // Download male SVG
        console.log(`  Downloading male SVG...`);
        await downloadSvg(metadata.images.male, path.join(exerciseDir, 'male.svg'));

        // Download female SVG
        console.log(`  Downloading female SVG...`);
        await downloadSvg(metadata.images.female, path.join(exerciseDir, 'female.svg'));

        // Save workout.json
        const workoutJson = {
            id: metadata.images.male.match(/id=(\d+)/)?.[1] || '',
            slug: metadata.slug,
            title: metadata.title,
            description: metadata.description,
            equipment: metadata.equipment,
            primary_muscles: metadata.primary_muscles,
            secondary_muscles: metadata.secondary_muscles,
            related_exercises: metadata.related_exercises,
            images: {
                male: metadata.images.male.replace('&a=1', ''),
                female: metadata.images.female.replace('&a=1', '')
            }
        };
        fs.writeFileSync(
            path.join(exerciseDir, 'workout.json'),
            JSON.stringify(workoutJson, null, 2)
        );

        console.log(`  ✓ Saved ${slug}`);
        return { slug, status: 'success' };

    } catch (error) {
        console.log(`  ERROR: ${error.message}`);
        return { slug, status: 'error', error: error.message };
    }
}

// Main function
async function main() {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Get slugs from complete_new.html
    const slugs = extractSlugsFromFile('./complete_new.html');
    console.log(`Found ${slugs.length} exercises to download\n`);

    const results = { success: 0, skipped: 0, error: 0 };

    // Process exercises with delay to avoid rate limiting
    for (let i = 0; i < slugs.length; i++) {
        const result = await processExercise(slugs[i], i + 1, slugs.length);
        results[result.status] = (results[result.status] || 0) + 1;

        // Small delay between requests
        if (result.status === 'success') {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log('\n=== Download Complete ===');
    console.log(`Success: ${results.success}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log(`Errors: ${results.error}`);
}

main().catch(console.error);
