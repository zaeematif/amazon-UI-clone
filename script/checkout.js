import { cart, removeFromCart, updateDeliveryOption } from "../data/cart.js";
import { deliveryOptions, getDeliveryOption } from "../data/deliveryOptions.js";
import { currencyFix } from "./utils/currencyFix.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { findMatchingProduct } from "../data/products.js";


function renderPaymentSummary() {
  let productCost = 0;
  let shippingCost = 0;
  let totalItems = 0;

  cart.forEach((cartItem) => {
    totalItems +=  cartItem.quantity;

    const product = findMatchingProduct(cartItem);
    productCost += product.priceCents * cartItem.quantity;

    const deliveryOptionNumber = getDeliveryOption(cartItem.deliveryOptionId);
    shippingCost += deliveryOptionNumber.priceCents;
  });

  const totalBeforeTaxCents = shippingCost + productCost;
  const taxCents = totalBeforeTaxCents * 0.1;
  const totalCents = totalBeforeTaxCents + taxCents;

  const paymentSummaryHTML = `
          <div class="payment-summary-title">
            Order Summary
          </div>

          <div class="payment-summary-row">
            <div>Items (${totalItems}):</div>
            <div class="payment-summary-money">$${currencyFix(productCost)}</div>
          </div>

          <div class="payment-summary-row">
            <div>Shipping &amp; handling:</div>
            <div class="payment-summary-money">$${currencyFix(shippingCost)}</div>
          </div>

          <div class="payment-summary-row subtotal-row">
            <div>Total before tax:</div>
            <div class="payment-summary-money">$${currencyFix(totalBeforeTaxCents)}</div>
          </div>

          <div class="payment-summary-row">
            <div>Estimated tax (10%):</div>
            <div class="payment-summary-money">$${currencyFix(taxCents)}</div>
          </div>

          <div class="payment-summary-row total-row">
            <div>Order total:</div>
            <div class="payment-summary-money">$${currencyFix(totalCents)}</div>
          </div>

          <button class="place-order-button button-primary">
            Place your order
          </button>
  `;

  document.querySelector(".js-payment-summary").innerHTML = paymentSummaryHTML;
}

function renderOrderSummary() {
  let cartSummaryHTML = "";

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    const matchItem = findMatchingProduct(cartItem);

    const deliveryOptionId = cartItem.deliveryOptionId;

    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, "days");

    const dateString = deliveryDate.format("dddd, MMMM D");

    cartSummaryHTML += `
          <div class="cart-item-container js-checkout-cart-${matchItem.id}">
              <div class="delivery-date">
              Delivery Date: ${dateString}
              </div>

              <div class="cart-item-details-grid">
                <img class="product-image"
                  src="${matchItem.image}">

                <div class="cart-item-details">
                  <div class="product-name">
                  ${matchItem.name}
                  </div>
                  <div class="product-price">
                    $${currencyFix(matchItem.priceCents)}
                  </div>
                  <div class="product-quantity">
                    <span>
                      Quantity: <span class="quantity-label">${
                        cartItem.quantity
                      }</span>
                    </span>
                    <span class="delete-quantity-link link-primary js-delete-quantity-card"
                    data-product-id="${matchItem.id}">
                      Delete
                    </span>
                  </div>
                </div>

                <div class="delivery-options">
                  <div class="delivery-options-title">
                    Choose a delivery option:
                  </div>
                  
                    ${deliveryDateHTML(matchItem, cartItem)}

                </div>
              </div>
            </div>
      `;
  });

  function deliveryDateHTML(matchItem, cartItem) {
    let html = "";

    deliveryOptions.forEach((deliveryOption) => {
      let today = dayjs();
      let deliveryDate = today.add(deliveryOption.deliveryDays, "days");
      let formatDate = deliveryDate.format("dddd, MMMM D");

      const deliveryPrice =
        deliveryOption.priceCents === 0
          ? "FREE"
          : `$${currencyFix(deliveryOption.priceCents)} - `;

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

      html += `
        <div class="delivery-option js-delivery-option"
        data-product-id="${matchItem.id}"
        data-delivery-option-id="${deliveryOption.id}">
          <input type="radio" 
            ${isChecked ? "checked" : ""}
            class="delivery-option-input"
            name="delivery-option-${matchItem.id}">
          <div>
            <div class="delivery-option-date">
              ${formatDate}
            </div>
            <div class="delivery-option-price">
              $${deliveryPrice} Shipping
            </div>
          </div>
        </div>
      `;
    });

    return html;
  }

  document.querySelector(".js-cart-summary").innerHTML = cartSummaryHTML;

  document.querySelectorAll(".js-delete-quantity-card").forEach((link) => {
    link.addEventListener("click", () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);

      const container = document.querySelector(
        `.js-checkout-cart-${productId}`
      );

      container.remove();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll(".js-delivery-option").forEach((element) => {
    element.addEventListener("click", () => {
      const { productId, deliveryOptionId } = element.dataset;

      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });
}

renderOrderSummary();
renderPaymentSummary();
