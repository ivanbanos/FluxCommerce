import bcrypt



import pymongo

# MongoDB connection
DB_NAME = "FluxCommerce"
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client[DB_NAME]

stores = [
    {
        "name": "Restaurante El Sabor",
        "email": "restaurante@example.com",
        "password": "restaurante123",
        "category": "Restaurante",
        "products": [
            {"name": "Pizza", "price": 12.99, "stock": 20},
            {"name": "Hamburguesa", "price": 9.99, "stock": 30},
            {"name": "Ensalada", "price": 7.99, "stock": 25}
        ]
    },
    {
        "name": "Farmacia Central",
        "email": "farmacia@example.com",
        "password": "farmacia123",
        "category": "Farmacia",
        "products": [
            {"name": "Paracetamol", "price": 3.99, "stock": 100},
            {"name": "Alcohol", "price": 2.99, "stock": 80},
            {"name": "Curitas", "price": 1.99, "stock": 150}
        ]
    },
    {
        "name": "Supermercado La Esquina",
        "email": "supermercado@example.com",
        "password": "supermercado123",
        "category": "Supermercado",
        "products": [
            {"name": "Arroz", "price": 1.50, "stock": 200},
            {"name": "Leche", "price": 0.99, "stock": 180},
            {"name": "Huevos", "price": 2.50, "stock": 160}
        ]
    },
    {
        "name": "Librería Mundo Libro",
        "email": "libreria@example.com",
        "password": "libreria123",
        "category": "Librería",
        "products": [
            {"name": "Libro de aventuras", "price": 15.99, "stock": 40},
            {"name": "Cuaderno", "price": 2.99, "stock": 100},
            {"name": "Pluma", "price": 1.50, "stock": 120}
        ]
    },
    {
        "name": "Tienda de Mascotas Peluditos",
        "email": "mascotas@example.com",
        "password": "mascotas123",
        "category": "Mascotas",
        "products": [
            {"name": "Alimento para perros", "price": 25.99, "stock": 50},
            {"name": "Juguete para gatos", "price": 5.99, "stock": 60}
        ]
    },
    {
        "name": "Electrónica TecnoPlus",
        "email": "electronica@example.com",
        "password": "electronica123",
        "category": "Electrónica",
        "products": [
            {"name": "Auriculares", "price": 19.99, "stock": 70},
            {"name": "Mouse", "price": 10.99, "stock": 80},
            {"name": "Teclado", "price": 22.99, "stock": 60}
        ]
    },
    {
        "name": "Panadería Dulce Hogar",
        "email": "panaderia@example.com",
        "password": "panaderia123",
        "category": "Panadería",
        "products": [
            {"name": "Pan francés", "price": 1.20, "stock": 100},
            {"name": "Croissant", "price": 2.50, "stock": 80},
            {"name": "Pastel", "price": 15.00, "stock": 30}
        ]
    },
    {
        "name": "Floristería Primavera",
        "email": "floristeria@example.com",
        "password": "floristeria123",
        "category": "Floristería",
        "products": [
            {"name": "Rosas", "price": 10.00, "stock": 40},
            {"name": "Tulipanes", "price": 8.00, "stock": 35},
            {"name": "Orquídeas", "price": 20.00, "stock": 20}
        ]
    },
    {
        "name": "Juguetería Sonrisas",
        "email": "jugueteria@example.com",
        "password": "jugueteria123",
        "category": "Juguetería",
        "products": [
            {"name": "Muñeca", "price": 14.99, "stock": 50},
            {"name": "Carrito", "price": 9.99, "stock": 60},
            {"name": "Rompecabezas", "price": 7.99, "stock": 70}
        ]
    },
    {
        "name": "Miscelánea TodoEnUno",
        "email": "miscelanea@example.com",
        "password": "miscelanea123",
        "category": "Miscelánea",
        "products": [
            {"name": "Baterías", "price": 3.99, "stock": 100},
            {"name": "Linterna", "price": 6.99, "stock": 40},
            {"name": "Pegamento", "price": 2.50, "stock": 80}
        ]
    }
]

merchant_collection = db["Merchants"]
product_collection = db["Products"]


with open("store_credentials.txt", "w", encoding="utf-8") as cred_file:
    for store in stores:
    # Hash the password using official bcrypt for .NET BCrypt.Net compatibility
        password_bytes = store["password"][:72].encode("utf-8")
        salt = bcrypt.gensalt(rounds=12)
        password_hash = bcrypt.hashpw(password_bytes, salt).decode("utf-8")
        # Insert merchant
        merchant = {
            "Name": store["name"],
            "Email": store["email"],
            "PasswordHash": password_hash,
            "Phone": "555-123-4567",
            "StoreSlug": store["name"].lower().replace(" ", "-"),
            "ActivationToken": "",
            "State": "active",
            "IsActive": True
        }
        merchant_id = merchant_collection.insert_one(merchant).inserted_id

        # Insert products for merchant
        for prod in store["products"]:
            product = {
                "Name": prod["name"],
                "Price": prod["price"],
                "Stock": prod["stock"],
                "MerchantId": str(merchant_id),
                "IsDeleted": False,
                "Description": "",
                "Images": [],
                "CoverIndex": 0
            }
            product_collection.insert_one(product)

        # Write credentials
        cred_file.write(f"Email: {store['email']}, Password: {store['password']}\n")

print("Stores and products seeded. Credentials saved to store_credentials.txt.")
