export function updateFromLocalStorage() {
  const localCart = JSON.parse(localStorage.getItem("cart"));

  let quantity = 0;

  if (localCart) {
    localCart.forEach((localCartItem) => {
      quantity += localCartItem.quantity;
    });
  }

  document.querySelector("#added-items-cart").innerText = quantity;
}
