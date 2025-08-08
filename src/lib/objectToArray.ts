function objectToArray(data:any) {
  const finalArray = [];

  // Loop melalui kunci utama ('0', '1', dst.)
  for (const materialIndex in data) {
    const flatMaterialData = data[materialIndex];
    const nestedMaterial = {};

    // Loop melalui kunci yang menggunakan notasi titik
    for (const key in flatMaterialData) {
      let currentLevel: any = nestedMaterial;
      const parts = key.match(/[^.\[\]]+/g) || []; // Memecah kunci menjadi bagian-bagian

      // Loop melalui setiap bagian untuk membangun struktur
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        // Jika ini adalah bagian terakhir, tetapkan nilainya
        if (i === parts.length - 1) {
          currentLevel[part] = flatMaterialData[key];
        } else {
          const nextPart = parts[i + 1];
          const isNextPartNumeric = !isNaN(parseInt(nextPart, 10));

          // Jika belum ada, buat objek atau array baru
          if (!currentLevel[part]) {
            currentLevel[part] = isNextPartNumeric ? [] : {};
          }
          // Pindah ke level selanjutnya
          currentLevel = currentLevel[part];
        }
      }
    }
    finalArray.push(nestedMaterial);
  }

  return finalArray;
}

export default objectToArray;