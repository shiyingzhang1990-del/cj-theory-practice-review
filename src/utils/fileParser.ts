export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  if (ext === 'docx' || ext === 'doc') {
    // docx parsing happens on server side via mammoth
    // For client-side preview, read as text if possible
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  throw new Error(`不支持的文件格式: .${ext}，仅支持 .txt 和 .docx`);
}

export function getFileTypeLabel(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'txt') return '纯文本 (.txt)';
  if (ext === 'docx') return 'Word文档 (.docx)';
  if (ext === 'doc') return 'Word文档 (.doc)';
  return `未知格式 (.${ext})`;
}
