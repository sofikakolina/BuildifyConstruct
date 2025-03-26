import ifcopenshell
import ifcopenshell.geom
import numpy as np
from collections import defaultdict

# Загрузка IFC файла
ifc_file = ifcopenshell.open('models/КолдинТЭ_2-2_revit.ifc')


# Функция для расчета объема по геометрии
def calculate_volume(geometry):
    """Вычисляет объем объекта по его геометрии."""
    verts = np.array(geometry.verts).reshape(-1, 3)  # Вершины
    faces = np.array(geometry.faces).reshape(-1, 3)  # Грани

    volume = 0.0
    for face in faces:
        # Получаем вершины для текущей грани
        v0, v1, v2 = verts[face]
        # Вычисляем объем тетраэдра, образованного гранью и началом координат
        volume += np.dot(v0, np.cross(v1, v2)) / 6.0

    return abs(volume)  # Возвращаем абсолютное значение объема


# Функция для извлечения информации о балках и расчета их объема
def get_beams_info_with_volume(ifc_file):
    beams_info = []
    levels = defaultdict(list)

    # Получение всех элементов IfcBeam (балки)
    beams = ifc_file.by_type('IfcBeam')

    for beam in beams:
        beam_name = getattr(beam, 'Name', 'Unnamed Beam')
        beam_global_id = getattr(beam, 'GlobalId', 'N/A')
        beam_type = getattr(beam, 'ObjectType', 'N/A')
        beam_description = getattr(beam, 'Description', 'N/A')

        # Извлечение материалов, связанных с балкой
        materials = []
        for rel in getattr(beam, 'HasAssociations', []):
            if rel.is_a('IfcRelAssociatesMaterial'):
                material = rel.RelatingMaterial
                if material.is_a('IfcMaterial'):
                    materials.append(material.Name)
                elif material.is_a('IfcMaterialLayerSet'):
                    for layer in material.MaterialLayers:
                        if hasattr(layer, 'Material'):
                            materials.append(layer.Material.Name)

        # Получение геометрических данных балки и расчет объема
        volume = 0.0
        settings = ifcopenshell.geom.settings()
        try:
            geometry = ifcopenshell.geom.create_shape(settings, beam)
            if geometry:
                volume = calculate_volume(geometry.geometry)
        except Exception as e:
            print(f"Ошибка при обработке балки {beam_name}: {e}")

        beam_data = {
            'Name': beam_name,
            'GlobalId': beam_global_id,
            'Type': beam_type,
            'Description': beam_description,
            'Materials': materials,
            'Volume': volume
        }
        beams_info.append(beam_data)

        # Получаем уровень, на котором находится балка
        for rel in getattr(beam, 'ContainedInStructure', []):
            if rel.is_a('IfcRelContainedInSpatialStructure'):
                level = rel.RelatingStructure
                if level.is_a('IfcBuildingStorey'):
                    levels[level.Name].append(beam_data)
                    break

    return beams_info, levels


# Получение информации о балках
beams_info, levels = get_beams_info_with_volume(ifc_file)

# Вывод информации с группировкой по уровням
if beams_info:
    print(f"Общее количество балок в проекте: {len(beams_info)}\n")

    # Вывод информации о конкретной балке по GlobalId
    target_beam = next((beam for beam in beams_info if beam['GlobalId'] == '1aznOgcD9Fp9cJ8_9mfQun'), None)
    if target_beam:
        print("=" * 50)
        print("Информация о конкретной балке:")
        print(f"  Название: {target_beam['Name']}")
        print(f"  GlobalId: {target_beam['GlobalId']}")
        print(f"  Тип: {target_beam['Type']}")
        print(f"  Описание: {target_beam['Description']}")
        print(f"  Материалы: {', '.join(target_beam['Materials']) if target_beam['Materials'] else 'N/A'}")
        print(f"  Объем: {target_beam['Volume']:.3f} м³")
        print("=" * 50 + "\n")

    # Вывод информации по уровням
    for level_name, level_beams in levels.items():
        total_volume = sum(beam['Volume'] for beam in level_beams)

        print(f"\nУровень: {level_name}")
        print(f"Количество балок: {len(level_beams)}")
        print(f"Суммарный объем балок: {total_volume:.3f} м³")
        print("-" * 50)

        for idx, beam in enumerate(level_beams, start=1):
            print(f"\n  Балка {idx}:")
            print(f"    Название: {beam['Name']}")
            print(f"    GlobalId: {beam['GlobalId']}")
            print(f"    Тип: {beam['Type']}")
            print(f"    Материалы: {', '.join(beam['Materials']) if beam['Materials'] else 'N/A'}")
            print(f"    Объем: {beam['Volume']:.3f} м³")

        print("\n" + "=" * 50)
else:
    print("Балки не найдены.")