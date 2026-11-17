/** Saves text as a file through a temporary object URL; nothing leaves the device. */
export function downloadTextFile(fileName: string, text: string, mimeType: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoke on the next task: some browsers start the download asynchronously after click().
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
