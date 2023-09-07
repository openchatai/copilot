// https://gist.github.com/ryanto/ad9a9a53a085c4c4609cd8cc0e5d9e07

export async function Await<T>({
  promise,
  children,
}: {
  promise: Promise<T>;
  children: (value: T) => JSX.Element;
}) {
  let data = await promise;

  return children(data);
}
