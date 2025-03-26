import ifcopenshell
import ifcopenshell.geom
import numpy as np
import sys
from collections import defaultdict

def calculate_volume(geometry):
    """Вычисляет объем объекта по его геометрии."""
    verts = np.array(geometry.verts).reshape(-1, 3)
    faces = np.array(geometry.faces).reshape(-1, 3)
    volume = 0.0
    for face in faces:
        v0, v1, v2 = verts[face]
        volume += np.dot(v0, np.cross(v1, v2)) / 6.0
    return abs(volume)

def get_level_elevation(level):
    """Получает отметку уровня из его свойств."""
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

def get_columns_by_level(ifc_file):
    """Анализирует колонны с группировкой по уровням."""
    level_stats = defaultdict(lambda: {
        'count': 0,
        'total_volume': 0.0,
        'elevation': None,
        'materials': set(),
        'columns': []
    })

    columns = ifc_file.by_type('IfcColumn')

    for column in columns:
        try:
            # Основные свойства
            column_name = column.Name or 'Unnamed Column'
            column_type = column.ObjectType or 'N/A'
            global_id = column.GlobalId

            # Определение уровня и отметки
            level = 'Unknown Level'
            elevation = None
            for rel in getattr(column, 'ContainedInStructure', []):
                if rel.is_a('IfcRelContainedInSpatialStructure'):
                    level_obj = rel.RelatingStructure
                    level = level_obj.Name or 'Unknown Level'
                    elevation = get_level_elevation(level_obj)
                    break

            # Расчет объема
            volume = 0.0
            settings = ifcopenshell.geom.settings()
            try:
                shape = ifcopenshell.geom.create_shape(settings, column)
                if shape:
                    volume = calculate_volume(shape.geometry)
            except Exception as e:
                print(f"Ошибка обработки колонны {column_name}: {e}")

            # Получаем материалы
            materials = []
            for rel in getattr(column, 'HasAssociations', []):
                if rel.is_a('IfcRelAssociatesMaterial'):
                    material = rel.RelatingMaterial
                    if material.is_a('IfcMaterial'):
                        materials.append(material.Name)
                    elif material.is_a('IfcMaterialProfileSet'):
                        for profile in material.MaterialProfiles:
                            if hasattr(profile, 'Material'):
                                materials.append(profile.Material.Name)

            # Данные колонны
            column_data = {
                'name': f"{column_type}:{column_name}",
                'type': column_type,
                'volume': volume,
                'global_id': global_id,
                'level': level,
                'elevation': elevation,
                'materials': materials
            }

            # Обновляем статистику по уровням
            level_stats[level]['count'] += 1
            level_stats[level]['total_volume'] += volume
            level_stats[level]['materials'].update(materials)
            level_stats[level]['columns'].append(column_data)
            if elevation is not None:
                level_stats[level]['elevation'] = elevation

        except Exception as e:
            print(f"Error processing column: {e}", file=sys.stderr)
            continue

    return {
        'level_stats': dict(level_stats),
        'total_count': len(columns),
        'total_volume': sum(level['total_volume'] for level in level_stats.values())
    }

def main():
    if len(sys.argv) < 2:
        print("Error: No IFC file path provided", file=sys.stderr)
        sys.exit(1)

    model_path = sys.argv[1]
    try:
        ifc_file = ifcopenshell.open(model_path)
        analysis = get_columns_by_level(ifc_file)

        print(f"\nОбщее количество колонн: {analysis['total_count']}")
        print(f"Общий объем бетона: {analysis['total_volume']:.2f} м³")

        for level, stats in sorted(analysis['level_stats'].items()):
            elevation_str = f"{stats['elevation']:.2f}" if stats['elevation'] is not None else "N/A"
            for i, column in enumerate(stats['columns'], 1):
                column_elevation = f"{column['elevation']:.2f}" if column['elevation'] is not None else "N/A"
                print(f"\n  Колонна {i}:")
                print(f"    Название: {column['name']}")
                print(f"    GlobalId: {column['global_id']}")
                print(f"    Тип: {column['type']}")
                print(f"    Объем: {column['volume']:.2f} м³")
                print(f"    Материалы: {', '.join(column['materials']) if column['materials'] else 'Не указаны'}")
                print(f"    Уровень: {column['level']}")
                print(f"    Отметка уровня: {column_elevation} м")

    except Exception as e:
        print(f"Error processing IFC file: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()