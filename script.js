document.querySelectorAll(".galleryItemWrapper").forEach((wrapper) => {
  // Предполагаем, что текстовой элемент лежит внутри .galleryItem (нажмите на нужное, здесь — первый <p>)
  const galleryItem = wrapper.querySelector(".galleryItem");
  const textEl = galleryItem.querySelector("p");

  // Получаем фоновое изображение из CSS (например: url("./assets/images/1.webp"))
  let bg = window.getComputedStyle(galleryItem).backgroundImage;
  const urlMatch = bg.match(/url\(["']?(.*?)["']?\)/);
  if (!urlMatch) return;
  const imageUrl = urlMatch[1];

  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {
    // Создаем Canvas и рисуем изображение
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Получаем размеры контейнера и текстового элемента
    const itemRect = galleryItem.getBoundingClientRect();
    const textRect = textEl.getBoundingClientRect();

    // Если фон растянут по всему блоку (background-size: 100% 100%), то
    // рассчитаем коэффициенты масштабирования
    const scaleX = img.naturalWidth / itemRect.width;
    const scaleY = img.naturalHeight / itemRect.height;

    // Вычисляем позицию текстового элемента относительно контейнера
    const offsetX = textRect.left - itemRect.left;
    const offsetY = textRect.top - itemRect.top;

    // Переводим координаты текстового элемента в координаты canvas
    const canvasX = offsetX * scaleX;
    const canvasY = offsetY * scaleY;
    const canvasWidth = textRect.width * scaleX;
    const canvasHeight = textRect.height * scaleY;

    try {
      const imageData = ctx.getImageData(
        canvasX,
        canvasY,
        canvasWidth,
        canvasHeight
      );
      const data = imageData.data;
      let totalBrightness = 0;
      let count = 0;

      // Проходим по всем пикселям области
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Простая формула яркости
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
        count++;
      }

      const avgBrightness = totalBrightness / count;
      const threshold = 128; // можно корректировать

      // Если средняя яркость ниже порога — фон тёмный, поэтому текст делаем белым,
      // иначе — делаем текст чёрным.
      if (avgBrightness < threshold) {
        textEl.style.color = "#fff";
      } else {
        textEl.style.color = "#000";
      }
    } catch (error) {
      console.error("Ошибка получения данных изображения", error);
    }
  };

  // Можно добавить обработку ошибок загрузки изображения
  img.onerror = (error) => {
    console.error("Ошибка загрузки фонового изображения:", imageUrl, error);
  };
});
