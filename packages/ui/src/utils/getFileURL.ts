export default function getFileURL(file: File) {
  return URL.createObjectURL(file);
}
