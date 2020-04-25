export default (stateName: string) => {
  const raw = window.sessionStorage.getItem(`${stateName}-state`);
  return raw && raw.length ? JSON.parse(raw) : '';
}