const products = [
{name: "Laptop", price: 999.99, description: "A high-performance laptop suitable for all your computing needs.",image: "laptop.jpg" },
{name: "Smartphone", price: 699.99, description: "A sleek smartphone with the latest features and a stunning display.",image:"smartphone.jpg" },
{name: "Headphones", price: 199.99, description: "Noise-cancelling headphones for an immersive audio experience.",image: "headphones.jpg" },
];

function displayProducts() {
   let str = '';
   products.map((e) => {
    str = str + `
    <div class="product-card">
      <img src=${e.image} width="300" height="300"/> 
      <h1>${e.name}</h1>
      <p>${e.description}</p>
      <p>$${e.price}</p>
      <button class="add">Add to Cart</button>
    </div>`;
   });
   root.innerHTML = str;
}