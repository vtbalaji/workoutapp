#!/usr/bin/env python3
"""Remove #e6e6e6 watermark paths from SVG files"""

import sys
import re
from pathlib import Path

def remove_watermarks(svg_path):
    """Remove all paths with fill='#e6e6e6' (watermark color)"""
    content = Path(svg_path).read_text()
    
    # Count before
    before_count = content.count('fill="#e6e6e6"')
    
    # Remove <path fill="#e6e6e6" .../>  patterns
    # This regex matches path elements with the watermark fill color
    pattern = r'<path\s+fill="#e6e6e6"[^>]*/>'
    content = re.sub(pattern, '', content)
    
    # Also handle <path fill="#e6e6e6" ...>...</path> if any
    pattern2 = r'<path\s+fill="#e6e6e6"[^>]*>.*?</path>'
    content = re.sub(pattern2, '', content, flags=re.DOTALL)
    
    # Count after
    after_count = content.count('fill="#e6e6e6"')
    
    # Save
    Path(svg_path).write_text(content)
    
    return before_count, after_count

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove-watermark.py <svg_file_or_directory>")
        sys.exit(1)
    
    path = Path(sys.argv[1])
    
    if path.is_file():
        before, after = remove_watermarks(path)
        print(f"Processed {path}: removed {before - after} watermark paths")
    elif path.is_dir():
        total_removed = 0
        files = list(path.rglob("*.svg"))
        for svg_file in files:
            if '.backup' in str(svg_file):
                continue
            before, after = remove_watermarks(svg_file)
            removed = before - after
            if removed > 0:
                print(f"  {svg_file.name}: removed {removed} paths")
            total_removed += removed
        print(f"\nTotal: processed {len(files)} files, removed {total_removed} watermark paths")
