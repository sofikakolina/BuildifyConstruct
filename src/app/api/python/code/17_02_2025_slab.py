import ifcopenshell
import ifcopenshell.geom
import numpy as np
import sys
from collections import defaultdict

def calculate_volume(geometry):
    """Calculate volume from geometry."""
    verts = np.array(geometry.verts).reshape(-1, 3)
    faces = np.array(geometry.faces).reshape(-1, 3)
    volume = 0.0
    for face in faces:
        v0, v1, v2 = verts[face]
        volume += np.dot(v0, np.cross(v1, v2)) / 6.0
    return abs(volume)

def get_level_elevation(level):
    """Get elevation of a level from its properties."""
    if hasattr(level, 'Elevation'):
        return level.Elevation
    elif hasattr(level, 'ObjectPlacement'):
        placement = level.ObjectPlacement
        while placement:
            if placement.is_a('IfcLocalPlacement'):
                if placement.RelativePlacement.is_a('IfcAxis2Placement3D'):
                    location = placement.RelativePlacement.Location
                    return location.Coordinates[2]
            placement = getattr(placement, 'PlacementRelTo', None)
    return None

def get_slabs_analysis(ifc_file):
    """Analyze slabs with level and type grouping."""
    level_stats = defaultdict(lambda: {
        'count': 0,
        'total_volume': 0.0,
        'elevation': None,
        'types': defaultdict(int),
        'slabs': []
    })

    slabs = ifc_file.by_type('IfcSlab')

    for slab in slabs:
        try:
            # Basic properties
            slab_name = slab.Name or 'Unnamed Slab'
            slab_type = slab.ObjectType or 'N/A'
            global_id = slab.GlobalId

            # Determine level and elevation
            level = 'Unknown Level'
            elevation = None
            for rel in getattr(slab, 'ContainedInStructure', []):
                if rel.is_a('IfcRelContainedInSpatialStructure'):
                    level_obj = rel.RelatingStructure
                    level = level_obj.Name or 'Unknown Level'
                    elevation = get_level_elevation(level_obj)
                    break

            # Calculate volume
            volume = 0.0
            settings = ifcopenshell.geom.settings()
            shape = ifcopenshell.geom.create_shape(settings, slab)
            if shape:
                volume = calculate_volume(shape.geometry)

            # Store slab data
            slab_data = {
                'name': f"{slab_type}:{slab_name}",
                'type': slab_type,
                'volume': volume,
                'global_id': global_id,
                'level': level,
                'elevation': elevation
            }

            # Update level statistics
            level_stats[level]['count'] += 1
            level_stats[level]['total_volume'] += volume
            level_stats[level]['types'][slab_type] += 1
            level_stats[level]['slabs'].append(slab_data)
            if elevation is not None:
                level_stats[level]['elevation'] = elevation

        except Exception as e:
            print(f"Error processing slab: {e}", file=sys.stderr)
            continue

    return {
        'level_stats': dict(level_stats),
        'total_count': len(slabs),
        'total_volume': sum(level['total_volume'] for level in level_stats.values())
    }

def main():
    if len(sys.argv) < 2:
        print("Error: No IFC file path provided", file=sys.stderr)
        sys.exit(1)

    model_path = sys.argv[1]
    try:
        ifc_file = ifcopenshell.open(model_path)
        analysis = get_slabs_analysis(ifc_file)

        # Print results in consistent format
        print(f"Общее количество перекрытий: {analysis['total_count']}")
        print(f"Общий объем перекрытий: {analysis['total_volume']:.2f} м³")

        for level, stats in sorted(analysis['level_stats'].items()):
            elevation_str = f"{stats['elevation']:.2f}" if stats['elevation'] is not None else "N/A"
            for i, slab in enumerate(stats['slabs'], 1):
                slab_elevation = f"{slab['elevation']:.2f}" if slab['elevation'] is not None else "N/A"
                print(f"\n  Перекрытие {i}:")
                print(f"    Название: {slab['name']}")
                print(f"    GlobalId: {slab['global_id']}")
                print(f"    Тип: {slab['type']}")
                print(f"    Объем: {slab['volume']:.2f} м³")
                print(f"    Уровень: {slab['level']}")
                print(f"    Отметка уровня: {slab_elevation} м")

        # print("\n=== СВОДНАЯ ТАБЛИЦА ===")
        # print(f"{'Уровень':<20} {'Отметка':<10} {'Кол-во':<10} {'Объем (м³)':<15} {'Основные типы'}")
        # print("-" * 70)
        # for level, stats in sorted(analysis['level_stats'].items()):
        #     elevation_str = f"{stats['elevation']:.2f}" if stats['elevation'] is not None else "N/A"
        #     main_types = ', '.join(list(stats['types'].keys())[:3])
        #     print(f"{level:<20} {elevation_str:<10} {stats['count']:<10} {stats['total_volume']:<15.2f} {main_types}")

    except Exception as e:
        print(f"Error processing IFC file: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()