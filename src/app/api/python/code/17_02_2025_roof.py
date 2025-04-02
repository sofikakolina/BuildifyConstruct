import ifcopenshell
import ifcopenshell.geom
import numpy as np
from collections import defaultdict
import sys


def calculate_volume_and_dimensions(geometry):
    """Вычисляет объем и габариты объекта по его геометрии."""
    verts = np.array(geometry.verts).reshape(-1, 3)  # Вершины
    faces = np.array(geometry.faces).reshape(-1, 3)  # Грани

    # Вычисление объема
    volume = 0.0
    for face in faces:
        v0, v1, v2 = verts[face]
        volume += np.dot(v0, np.cross(v1, v2)) / 6.0
    volume = abs(volume)

    # Вычисление габаритов (ширина, высота, длина)
    if len(verts) > 0:
        min_coords = np.min(verts, axis=0)
        max_coords = np.max(verts, axis=0)
        dimensions = max_coords - min_coords
        width, height, length = dimensions
    else:
        width, height, length = 0.0, 0.0, 0.0

    return volume, width, height, length


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


def get_roofs_analysis(ifc_file):
    """Анализирует крыши с группировкой по типам и этажам."""
    roofs_info = []
    type_stats = defaultdict(lambda: {'count': 0, 'total_area': 0, 'total_volume': 0})
    level_stats = defaultdict(lambda: {
        'count': 0,
        'types': set(),
        'roofs': [],
        'total_area': 0,
        'total_volume': 0,
        'elevation': None
    })

    roofs = ifc_file.by_type('IfcRoof')

    for roof in roofs:
        # Основные свойства
        roof_name = getattr(roof, 'Name', 'Unnamed Roof')
        roof_type = getattr(roof, 'ObjectType', 'N/A')
        description = getattr(roof, 'Description', 'N/A')

        # Извлечение материалов
        materials = []
        material_layers = []
        for rel in getattr(roof, 'HasAssociations', []):
            if rel.is_a('IfcRelAssociatesMaterial'):
                material = rel.RelatingMaterial

                if material.is_a('IfcMaterial'):
                    materials.append({
                        'name': material.Name,
                        'thickness': None,
                        'type': 'simple'
                    })
                
                elif material.is_a('IfcMaterialLayerSet') or material.is_a('IfcMaterialLayerSetUsage'):
                    layer_set = material.ForLayerSet if hasattr(material, 'ForLayerSet') else material
                    for layer in layer_set.MaterialLayers:
                        if hasattr(layer, 'Material'):
                            materials.append({
                                'name': layer.Material.Name,
                                'thickness': layer.LayerThickness,
                                'type': 'layer'
                            })
                            material_layers.append(layer)

        # Определение уровня (этажа)
        level = 'Unknown Level'
        elevation = None
        for rel in getattr(roof, 'ContainedInStructure', []):
            if rel.is_a('IfcRelContainedInSpatialStructure'):
                level_obj = rel.RelatingStructure
                level = getattr(rel.RelatingStructure, 'Name', 'Unknown Level')
                elevation = get_level_elevation(level_obj)
                break

        # Получение геометрии и расчет площади/объема/габаритов
        volume = 0.0
        area = 0.0
        width = 0.0
        height = 0.0
        length = 0.0
        has_geometry = False
        settings = ifcopenshell.geom.settings()
        
        try:
            shape = ifcopenshell.geom.create_shape(settings, roof)
            if shape:
                has_geometry = True
                volume, width, height, length = calculate_volume_and_dimensions(shape.geometry)
                
                # Расчет площади поверхности
                verts = np.array(shape.geometry.verts).reshape(-1, 3)
                faces = np.array(shape.geometry.faces).reshape(-3, 3)
                for face in faces:
                    v0, v1, v2 = verts[face]
                    area += 0.5 * np.linalg.norm(np.cross(v1-v0, v2-v0))
        except Exception as e:
            print(f"Ошибка при обработке крыши {roof_name}: {e}", file=sys.stderr)
            continue  # Пропускаем крыши без геометрии

        if not has_geometry:
            print(f"Предупреждение: Крыша '{roof_name}' (GlobalId: {getattr(roof, 'GlobalId', 'N/A')}) не имеет геометрии", file=sys.stderr)
            continue  # Пропускаем крыши без геометрии

        # Расчет объемов и площадей для каждого материала (для слоистых крыш)
        material_data = []
        if material_layers:
            total_thickness = sum(layer.LayerThickness for layer in material_layers)
            for layer in material_layers:
                if total_thickness > 0:
                    ratio = layer.LayerThickness / total_thickness
                    material_data.append({
                        'name': layer.Material.Name,
                        'volume': volume * ratio,
                        'area': area,
                        'thickness': layer.LayerThickness * 1000  # в мм
                    })
        else:
            for mat in materials:
                material_data.append({
                    'name': mat['name'],
                    'volume': volume,
                    'area': area,
                    'thickness': mat['thickness'] * 1000 if mat['thickness'] else None
                })

        # Формирование информации о материалах для вывода
        material_info = []
        for mat in material_data:
            if mat['thickness']:
                mat_str = f"{mat['name']} ({mat['thickness']:.0f} мм) - Объем_Материала: {mat['volume']:.3f} м³, Площадь_Материала: {mat['area']:.2f} м²"
            else:
                mat_str = f"{mat['name']} - Объем_Материала: {mat['volume']:.3f} м³, Площадь_Материала: {mat['area']:.2f} м²"
            material_info.append(mat_str)

        # Сохраняем информацию о крыше
        roof_data = {
            'name': roof_name,
            'type': roof_type,
            'description': description,
            'materials': material_info,
            'material_data': material_data,
            'volume': volume,
            'area': area,
            'width': width,
            'height': height,
            'length': length,
            'level': level,
            'elevation': elevation,
            'has_geometry': has_geometry,
            'global_id': getattr(roof, 'GlobalId', 'N/A')
        }
        roofs_info.append(roof_data)

        # Статистика по типам
        type_stats[roof_type]['count'] += 1
        type_stats[roof_type]['total_area'] += area
        type_stats[roof_type]['total_volume'] += volume

        # Статистика по этажам
        level_stats[level]['count'] += 1
        level_stats[level]['types'].add(roof_type)
        level_stats[level]['roofs'].append(roof_data)
        if elevation is not None:
            level_stats[level]['elevation'] = elevation
        level_stats[level]['total_area'] += area
        level_stats[level]['total_volume'] += volume

    return {
        'roofs': roofs_info,
        'type_stats': dict(type_stats),
        'level_stats': dict(level_stats),
        'total_count': len(roofs_info),
        'total_area': sum(roof['area'] for roof in roofs_info),
        'total_volume': sum(roof['volume'] for roof in roofs_info)
    }


def main():
    if len(sys.argv) < 2:
        print("Error: No IFC file path provided", file=sys.stderr)
        sys.exit(1)
    model_path = sys.argv[1]
    try:
        ifc_file = ifcopenshell.open(model_path)
        # Анализ файла
        analysis = get_roofs_analysis(ifc_file)

        # Вывод результатов
        print(f"\nОбщее количество крыш: {analysis['total_count']}")
        print(f"Общая площадь всех крыш: {analysis['total_area']:.2f} м²")
        print(f"Общий объем всех крыш: {analysis['total_volume']:.3f} м³\n")

        # Детализированный вывод по уровням
        for level, stats in sorted(analysis['level_stats'].items()):
            level_elevation = f"{stats['elevation']:.2f}" if stats.get('elevation') is not None else "N/A"
            print(f"\n=== Уровень: {level} (Отметка: {level_elevation} м) ===")
            print(f"Количество крыш: {stats['count']}")
            print(f"Общая площадь: {stats['total_area']:.2f} м²")
            print(f"Общий объем: {stats['total_volume']:.3f} м³")

            for i, roof in enumerate(stats['roofs'], 1):
                roof_elevation = f"{roof['elevation']:.2f}" if roof['elevation'] is not None else "N/A"
                print(f"\n  Крыша {i}:")
                print(f"    Название: {roof['name']}")
                print(f"    GlobalId: {roof['global_id']}")
                print(f"    Тип: {roof['type']}")
                print(f"    Площадь: {roof['area']:.2f} м²")
                print(f"    Объем: {roof['volume']:.3f} м³")
                print(f"    Габариты (Ш x В x Д): {roof['width']:.2f} x {roof['height']:.2f} x {roof['length']:.2f} м")
                print(f"    Уровень: {level}")
                print(f"    Отметка уровня: {roof_elevation} м")
                print(f"    Геометрия: {'Есть' if roof['has_geometry'] else 'Нет'}")
                print(f"    Материалы:")
                for material in roof['materials']:
                    print(f"      - {material}")

    except Exception as e:
        print(f"Error processing IFC file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()