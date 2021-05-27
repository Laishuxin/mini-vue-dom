function mountComponent (vm) {
  vm._update(vm._render());
}

export {
  mountComponent,
}
