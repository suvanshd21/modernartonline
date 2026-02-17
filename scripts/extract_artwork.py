#!/usr/bin/env python3
"""
Extract artwork from National Gallery of Art open data for Art Auction Game.

Creates a JSON file with themed artwork for each artist:
- Novak (Yellow): Geometric/Abstract
- Costa (Blue): Seascapes/Marine
- Bauer (Red): Architecture/Urban
- Vance (Green): Botanical/Nature
- Ruiz (Orange): Mythology/Fantasy

Usage:
    python scripts/extract_artwork.py /path/to/NationalGalleryOfArt/opendata

    Clone the NGA opendata repo first:
    git clone https://github.com/NationalGalleryOfArt/opendata.git
"""

import argparse
import csv
import json
import random
import sys
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent.parent / "frontend" / "src" / "data" / "artwork.json"

# Theme mappings for each artist
ARTIST_THEMES = {
    "Viktor Novak": {
        "themes": ["geometric", "non-representational"],
        "color": "yellow",
        "style": "geometric",
        "cards_needed": 12,
    },
    "Marina Costa": {
        "themes": ["seascape", "boat", "ship", "fish", "fishing", "seaside", "water"],
        "color": "blue",
        "style": "ocean",
        "cards_needed": 13,
    },
    "Leon Bauer": {
        "themes": ["architecture", "topographical", "exterior", "interior"],
        "color": "red",
        "style": "urban",
        "cards_needed": 14,
    },
    "Flora Vance": {
        "themes": ["botanical", "plant", "landscape", "nature", "animal", "bird"],
        "color": "green",
        "style": "botanical",
        "cards_needed": 15,
    },
    "Celeste Ruiz": {
        "themes": ["mythology", "fantasy", "classical", "history", "saints", "life of christ"],
        "color": "orange",
        "style": "cosmic",
        "cards_needed": 16,
    },
}


def load_images(opendata_path):
    """Load published images with their object IDs."""
    images = {}
    with open(opendata_path / "data" / "published_images.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            obj_id = row.get("depictstmsobjectid", "").strip()
            if obj_id and row.get("viewtype") == "primary":
                images[obj_id] = {
                    "uuid": row["uuid"],
                    "thumb_url": row["iiifthumburl"],
                    "full_url": row["iiifurl"],
                }
    return images


def load_objects(opendata_path):
    """Load object metadata."""
    objects = {}
    with open(opendata_path / "data" / "objects.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            obj_id = row.get("objectid", "").strip()
            if obj_id:
                objects[obj_id] = {
                    "title": row.get("title", "").strip(),
                    "artist": row.get("attribution", "").strip(),
                    "date": row.get("displaydate", "").strip(),
                    "medium": row.get("medium", "").strip()[:100],
                    "classification": row.get("classification", "").strip(),
                }
    return objects


def load_object_themes(opendata_path):
    """Load themes for each object."""
    themes = {}
    with open(opendata_path / "data" / "objects_terms.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("termtype") == "Theme":
                obj_id = row.get("objectid", "").strip()
                term = row.get("term", "").strip().lower()
                if obj_id and term:
                    if obj_id not in themes:
                        themes[obj_id] = []
                    themes[obj_id].append(term)
    return themes


def find_artwork_for_theme(themes_wanted, object_themes, objects, images, count):
    """Find artwork matching the given themes."""
    matching = []

    for obj_id, obj_themes in object_themes.items():
        # Check if any wanted theme matches
        if any(t in themes_wanted for t in obj_themes):
            # Must have an image
            if obj_id in images and obj_id in objects:
                obj = objects[obj_id]
                img = images[obj_id]
                # Prefer paintings and drawings
                if obj["classification"] in ["Painting", "Drawing", "Print"]:
                    matching.append({
                        "object_id": obj_id,
                        "title": obj["title"],
                        "artist": obj["artist"],
                        "date": obj["date"],
                        "thumb_url": img["thumb_url"],
                        "iiif_base": img["full_url"],
                        "themes": [t for t in obj_themes if t in themes_wanted],
                    })

    # Shuffle and take what we need
    random.seed(42)  # Reproducible
    random.shuffle(matching)
    return matching[:count]


def main():
    parser = argparse.ArgumentParser(
        description="Extract themed artwork from NGA open data for Art Auction Game"
    )
    parser.add_argument(
        "opendata_path",
        type=Path,
        help="Path to the NationalGalleryOfArt/opendata repository clone"
    )
    args = parser.parse_args()

    opendata_path = args.opendata_path
    if not (opendata_path / "data").exists():
        print(f"Error: {opendata_path}/data not found.")
        print("Make sure you've cloned https://github.com/NationalGalleryOfArt/opendata")
        sys.exit(1)

    print("Loading NGA open data...")
    print("  Loading images...")
    images = load_images(opendata_path)
    print(f"    Found {len(images)} images")

    print("  Loading objects...")
    objects = load_objects(opendata_path)
    print(f"    Found {len(objects)} objects")

    print("  Loading themes...")
    object_themes = load_object_themes(opendata_path)
    print(f"    Found themes for {len(object_themes)} objects")

    print("\nFinding artwork for each artist...")
    result = {}

    for artist_name, config in ARTIST_THEMES.items():
        print(f"\n  {artist_name} ({config['style']}):")
        artwork = find_artwork_for_theme(
            config["themes"],
            object_themes,
            objects,
            images,
            config["cards_needed"] + 5  # Get a few extra
        )
        print(f"    Found {len(artwork)} matching artworks")

        result[artist_name] = {
            "color": config["color"],
            "style": config["style"],
            "artwork": artwork[:config["cards_needed"]],
        }

        # Print first few
        for i, art in enumerate(artwork[:3]):
            print(f"      {i+1}. {art['title'][:50]}...")

    # Ensure output directory exists
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Write output
    with open(OUTPUT_PATH, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\nWrote artwork data to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
