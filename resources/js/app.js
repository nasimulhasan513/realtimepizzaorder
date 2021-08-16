import axios from "axios";
import Noty from "noty";
import moment from "moment";
import { initAdmin } from "./admin";

let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");
// socket connection

let socket = io();

function updateCart(pizza) {
  axios
    .post("/update-cart", pizza)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: "success",
        timeout: 1000,
        progressBar: false,
        text: "Item added to cart",
      }).show();
    })
    .catch((error) => {
      new Noty({
        type: "errror",
        timeout: 1000,
        progressBar: false,
        text: "Something went wrong",
      }).show();
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
  });
});

// remove alert message

const alertmsg = document.querySelector("#success-alert");
if (alertmsg) {
  setTimeout(() => {
    alertmsg.remove();
  }, 2000);
}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  socket.emit("join", "adminRoom");
  initAdmin(socket);
}
// change order status
let statuses = document.querySelectorAll(".status_line");

let order = document.querySelector("#hiddeninput")
  ? document.querySelector("#hiddeninput").value
  : null;

order = JSON.parse(order);

let time = document.createElement("small");

function updateStatus(order) {
  statuses.forEach((s) => {
    s.classList.remove("step-completed");
    s.classList.remove("current");
  });
  let stepCompleted = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("step-completed");
    }
    if (dataProp == order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format("hh:mm A");
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updateStatus(order);

// join the
if (order) {
  socket.emit("join", `order_${order._id}`);
}

socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment(data.updatedAt).format("hh:mm A");
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);
  new Noty({
    type: "success",
    timeout: 1000,
    progressBar: false,
    text: "Order Updated",
  }).show();
});
