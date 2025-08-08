function flatToObject(formData: any){
  const result = {};

  for (const [key, value] of formData.entries()) {
    // Memecah kunci menjadi beberapa bagian, misal: 'materials.0.statusQc' -> ['materials', '0', 'statusQc']
    // Regex ini menangani notasi titik (objek) dan angka (indeks array).
    const parts = key.match(/[^.\[\]]+/g) || [];
    let current: any = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      const isLastPart = i === parts.length - 1;

      if (isLastPart) {
        // Jika ini adalah bagian terakhir, tetapkan nilainya.
        current[part] = value;
      } else {
        // Jika bagian selanjutnya adalah angka, maka bagian saat ini haruslah sebuah array.
        const isNextPartNumeric = !isNaN(parseInt(nextPart, 10));

        if (!current[part]) {
          // Buat array atau objek baru jika belum ada.
          current[part] = isNextPartNumeric ? [] : {};
        }
        // Pindah ke level selanjutnya.
        current = current[part];
      }
    }
  }

  return result;
}

export default flatToObject;