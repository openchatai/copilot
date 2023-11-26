import NProgress from "nprogress";

export function onStart() {
  NProgress.start();
}

export function onComplete() {
  NProgress.done();
}
