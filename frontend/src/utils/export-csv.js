import api from '../services/axios';

export const downloadCsv = async (url, fileName) => {
  try {

    const response = await api.get(url, {
      responseType: 'blob', // Important for file download
    });

    // Create a blob link to download
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // Set filename dynamically
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);

  } catch (error) {
    console.error('Error downloading CSV:', error);
  }
};
