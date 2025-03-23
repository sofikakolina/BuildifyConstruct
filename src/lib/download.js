import axios from 'axios';

export const downloadFile = async (src) => {
  try {
    // Запрос на сервер для получения файла
    const response = await axios.get("/api/download", {
      params: { fileName: src },
      responseType: 'blob', // Указываем, что ожидаем бинарные данные
    });

    // Определяем имя файла из заголовка Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let fileName = src.substring(src.lastIndexOf("/") + 1); // Имя файла по умолчанию

    if (contentDisposition && contentDisposition.includes("filename*=UTF-8''")) {
      fileName = decodeURIComponent(
        contentDisposition.split("filename*=UTF-8''")[1]
      );
    }

    // Создаем Blob из полученных данных
    const blob = new Blob([response.data], { type: response.headers['content-type'] });

    // Создаем временную ссылку для скачивания
    const downloadUrl = URL.createObjectURL(blob);

    // Создаем элемент <a> для скачивания
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName; // Используем имя файла из заголовка
    document.body.appendChild(a);
    a.click(); // Инициируем скачивание

    // Очищаем ссылку и удаляем элемент <a>
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
};