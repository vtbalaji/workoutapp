#!/usr/bin/env python3
"""
Batch remove WorkoutLabs watermarks from ALL SVG files - AUTO RUN
Processes all subdirectories (no confirmation needed)
"""

import xml.etree.ElementTree as ET
from pathlib import Path
import shutil
import re
from datetime import datetime
import time

def find_parent(root, element):
    """Find parent element in XML tree"""
    for parent in root.iter():
        for child in parent:
            if child == element:
                return parent
    return None

def remove_all_watermarks(svg_path, backup=True):
    """Remove ALL watermark instances from a single SVG file"""
    try:
        # Backup original file
        if backup:
            backup_path = svg_path.with_suffix('.svg.backup')
            if not backup_path.exists():
                shutil.copy2(svg_path, backup_path)

        # Parse SVG
        ET.register_namespace('', 'http://www.w3.org/2000/svg')
        tree = ET.parse(svg_path)
        root = tree.getroot()

        # Collect all path elements
        all_paths = []
        for elem in root.iter():
            tag = elem.tag.split('}')[-1]
            if tag == 'path':
                all_paths.append(elem)

        total_paths = len(all_paths)

        # Identify ALL watermark paths
        watermark_candidates = []

        for i, path in enumerate(all_paths):
            fill = path.get('fill', '')
            d = path.get('d', '')

            is_watermark = False

            if fill == '#e6e6e6':
                if 50 < len(d) < 600:
                    if d.startswith('m') or d.startswith('M'):
                        match = re.search(r'[mM]\s*([\d.]+)[\s,]+([\d.]+)', d)
                        if match:
                            try:
                                y = float(match.group(2))
                                if (150 <= y <= 180) or (280 <= y <= 320) or (420 <= y <= 450):
                                    is_watermark = True
                            except:
                                pass

            if is_watermark:
                watermark_candidates.append(path)

        # Remove watermark paths
        removed_count = 0
        for path_elem in watermark_candidates:
            parent = find_parent(root, path_elem)
            if parent is not None:
                parent.remove(path_elem)
                removed_count += 1

        # Save modified file
        tree.write(svg_path, encoding='utf-8', xml_declaration=True)

        return {
            'success': True,
            'total_paths': total_paths,
            'removed': removed_count,
            'final_paths': total_paths - removed_count
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def batch_process_all(base_dir, skip_root=True):
    """Process all SVG files in subdirectories"""
    base_path = Path(base_dir)

    # Find all SVG files
    all_svg_files = list(base_path.rglob("*.svg"))

    # Filter out backup files and optionally root directory files
    svg_files = []
    for f in all_svg_files:
        if '.backup' in f.name:
            continue
        if skip_root and f.parent == base_path:
            continue
        svg_files.append(f)

    total_files = len(svg_files)

    print("\n" + "="*70)
    print("BATCH WATERMARK REMOVAL - AUTO RUN")
    print("="*70)
    print(f"\nFound {total_files} SVG files in subdirectories")
    print(f"Base directory: {base_dir}")
    print("\nProcessing...")
    print("="*70 + "\n")

    # Statistics
    stats = {
        'total_files': total_files,
        'success': 0,
        'failed': 0,
        'total_paths_removed': 0,
        'errors': []
    }

    start_time = time.time()

    # Process each file
    for i, svg_file in enumerate(svg_files, 1):
        rel_path = svg_file.relative_to(base_path)

        # Show progress for every file (compact format)
        if i % 50 == 0 or i == 1:
            print(f"[{i}/{total_files}] {rel_path}")

        result = remove_all_watermarks(svg_file, backup=True)

        if result['success']:
            stats['success'] += 1
            stats['total_paths_removed'] += result['removed']
        else:
            stats['failed'] += 1
            stats['errors'].append({
                'file': str(rel_path),
                'error': result['error']
            })
            print(f"  ✗ Failed: {rel_path} - {result['error']}")

        # Progress indicator every 100 files
        if i % 100 == 0:
            elapsed = time.time() - start_time
            avg_time = elapsed / i
            remaining = (total_files - i) * avg_time
            print(f"  Progress: {i}/{total_files} ({i/total_files*100:.1f}%) | Est. remaining: {remaining/60:.1f} min")

    elapsed_time = time.time() - start_time

    # Final summary
    print("\n" + "="*70)
    print("✅ BATCH PROCESSING COMPLETE")
    print("="*70)
    print(f"\n📊 Statistics:")
    print(f"  Total files processed: {stats['total_files']}")
    print(f"  ✓ Successful: {stats['success']}")
    print(f"  ✗ Failed: {stats['failed']}")
    print(f"  Total watermark paths removed: {stats['total_paths_removed']}")
    if stats['success'] > 0:
        print(f"  Average paths removed per file: {stats['total_paths_removed']/stats['success']:.1f}")
    print(f"\n⏱️  Time taken: {elapsed_time/60:.2f} minutes")
    print(f"  Average time per file: {elapsed_time/total_files:.2f} seconds")

    # Show errors if any
    if stats['errors']:
        print(f"\n❌ Errors ({len(stats['errors'])}):")
        for err in stats['errors'][:10]:
            print(f"  - {err['file']}: {err['error']}")
        if len(stats['errors']) > 10:
            print(f"  ... and {len(stats['errors']) - 10} more errors")

    # Create summary report
    report_path = base_path / f"watermark_removal_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(report_path, 'w') as f:
        f.write("WATERMARK REMOVAL REPORT\n")
        f.write("="*70 + "\n\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total files: {stats['total_files']}\n")
        f.write(f"Successful: {stats['success']}\n")
        f.write(f"Failed: {stats['failed']}\n")
        f.write(f"Total paths removed: {stats['total_paths_removed']}\n")
        f.write(f"Time taken: {elapsed_time/60:.2f} minutes\n\n")

        if stats['errors']:
            f.write("ERRORS:\n")
            for err in stats['errors']:
                f.write(f"  {err['file']}: {err['error']}\n")

    print(f"\n📄 Report saved to: {report_path.name}")
    print("="*70 + "\n")

    return stats

if __name__ == "__main__":
    base_dir = Path("/Users/balajithanigaiarasu/workout_scrapper")

    # Count files
    svg_files = list(base_dir.rglob("*.svg"))
    svg_files = [f for f in svg_files if '.backup' not in f.name and f.parent != base_dir]

    print("\n" + "="*70)
    print("BATCH WATERMARK REMOVAL - STARTING")
    print("="*70)
    print(f"\nFiles to process: {len(svg_files)}")
    print(f"Estimated time: ~{len(svg_files) * 0.15 / 60:.1f} minutes")
    print("\nBackups will be created (.svg.backup)")

    # Auto start
    stats = batch_process_all(base_dir, skip_root=True)

    print("\n✅ ALL DONE!")
    print(f"✓ Processed {stats['success']} files")
    print(f"✓ Removed {stats['total_paths_removed']} watermark paths total")
    print(f"✗ Failed: {stats['failed']} files")
