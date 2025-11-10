
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
            {"name": "Pizza", "price": 12.99, "stock": 20, "description": "Deliciosa pizza italiana con masa artesanal, salsa de tomate fresca, mozzarella y ingredientes de primera calidad. Perfecta para compartir en familia."},
            {"name": "Hamburguesa", "price": 9.99, "stock": 30, "description": "Hamburguesa gourmet con carne de res jugosa, lechuga fresca, tomate, cebolla, pepinillos y salsa especial en pan brioche tostado."},
            {"name": "Ensalada", "price": 7.99, "stock": 25, "description": "Ensalada mixta saludable con lechugas variadas, tomate cherry, zanahoria, pepino, maíz y aderezo de la casa. Rica en vitaminas y fibra."}
        ]
    },
    {
        "name": "Farmacia Central",
        "email": "farmacia@example.com",
        "password": "farmacia123",
        "category": "Farmacia",
        "products": [
            {"name": "Paracetamol", "price": 3.99, "stock": 100, "description": "Analgésico y antipirético para aliviar el dolor de cabeza, fiebre, dolores musculares y malestar general. Tabletas de 500mg."},
            {"name": "Alcohol", "price": 2.99, "stock": 80, "description": "Alcohol antiséptico al 70% para desinfectar heridas menores, limpiar instrumentos médicos y mantener la higiene personal."},
            {"name": "Curitas", "price": 1.99, "stock": 150, "description": "Apósitos adhesivos impermeables para proteger heridas pequeñas, cortaduras y raspaduras. Caja con 30 unidades variadas."}
        ]
    },
    {
        "name": "Supermercado La Esquina",
        "email": "supermercado@example.com",
        "password": "supermercado123",
        "category": "Supermercado",
        "products": [
            {"name": "Arroz", "price": 1.50, "stock": 200, "description": "Arroz blanco de grano largo, ideal para preparar comidas familiares, paellas, risottos y como acompañamiento. Bolsa de 1kg."},
            {"name": "Leche", "price": 0.99, "stock": 180, "description": "Leche fresca pasteurizada entera, rica en calcio y proteínas. Perfecta para el desayuno, batidos, postres y cocinar. Envase de 1 litro."},
            {"name": "Huevos", "price": 2.50, "stock": 160, "description": "Huevos frescos de gallina de granja, ricos en proteínas de alta calidad. Ideales para desayunos, tortillas, postres y repostería. Docena."}
        ]
    },
    {
        "name": "Librería Mundo Libro",
        "email": "libreria@example.com",
        "password": "libreria123",
        "category": "Librería",
        "products": [
            {"name": "Libro de aventuras", "price": 15.99, "stock": 40, "description": "Emocionante novela de aventuras llena de acción, misterio y personajes fascinantes. Perfecto para jóvenes lectores y adultos que aman las historias épicas."},
            {"name": "Cuaderno", "price": 2.99, "stock": 100, "description": "Cuaderno de espiral con hojas rayadas, ideal para estudiar, tomar notas, escribir diarios o hacer tareas escolares. 100 hojas de papel de calidad."},
            {"name": "Pluma", "price": 1.50, "stock": 120, "description": "Bolígrafo de tinta azul con punta media, escritura suave y fluida. Perfecto para uso diario en oficina, escuela o casa. Duradero y confiable."}
        ]
    },
    {
        "name": "Tienda de Mascotas Peluditos",
        "email": "mascotas@example.com",
        "password": "mascotas123",
        "category": "Mascotas",
        "products": [
            {"name": "Alimento para perros", "price": 25.99, "stock": 50, "description": "Alimento balanceado premium para perros adultos con pollo real, vitaminas, minerales y omega 3. Fortalece el sistema inmune y mantiene el pelaje brillante."},
            {"name": "Juguete para gatos", "price": 5.99, "stock": 60, "description": "Juguete interactivo con plumas y cascabel que estimula el instinto de caza felino. Ayuda a mantener a los gatos activos y entretenidos durante horas."}
        ]
    },
    {
        "name": "Electrónica TecnoPlus",
        "email": "electronica@example.com",
        "password": "electronica123",
        "category": "Electrónica",
        "products": [
            {"name": "Auriculares", "price": 19.99, "stock": 70, "description": "Auriculares inalámbricos con cancelación de ruido, sonido estéreo de alta calidad, micrófono integrado y batería de larga duración. Perfectos para música y llamadas."},
            {"name": "Mouse", "price": 10.99, "stock": 80, "description": "Mouse óptico ergonómico con sensor de precisión, click silencioso y diseño cómodo para uso prolongado. Compatible con PC y Mac. Cable USB incluido."},
            {"name": "Teclado", "price": 22.99, "stock": 60, "description": "Teclado mecánico retroiluminado con teclas programables, switches táctiles y diseño gaming. Perfecto para trabajo profesional y entretenimiento."}
        ]
    },
    {
        "name": "Panadería Dulce Hogar",
        "email": "panaderia@example.com",
        "password": "panaderia123",
        "category": "Panadería",
        "products": [
            {"name": "Pan francés", "price": 1.20, "stock": 100, "description": "Pan francés tradicional con corteza dorada y crujiente, miga suave y aireada. Horneado diariamente con ingredientes frescos y naturales."},
            {"name": "Croissant", "price": 2.50, "stock": 80, "description": "Croissant de mantequilla con hojaldre delicado y textura esponjosa. Perfecto para el desayuno con mermelada, chocolate o como base para sándwiches gourmet."},
            {"name": "Pastel", "price": 15.00, "stock": 30, "description": "Delicioso pastel de chocolate con capas de bizcocho húmedo, crema de chocolate y cobertura de ganache. Ideal para celebraciones y ocasiones especiales."}
        ]
    },
    {
        "name": "Floristería Primavera",
        "email": "floristeria@example.com",
        "password": "floristeria123",
        "category": "Floristería",
        "products": [
            {"name": "Rosas", "price": 10.00, "stock": 40, "description": "Rosas rojas frescas de tallo largo, símbolo de amor y pasión. Perfectas para expresar sentimientos románticos, aniversarios y ocasiones especiales. Ramo de 12 unidades."},
            {"name": "Tulipanes", "price": 8.00, "stock": 35, "description": "Tulipanes multicolor frescos que simbolizan la primavera y la renovación. Ideales para decorar el hogar, regalar y crear ambientes alegres y coloridos."},
            {"name": "Orquídeas", "price": 20.00, "stock": 20, "description": "Elegantes orquídeas en maceta, plantas exóticas de larga duración con flores delicadas. Perfectas para decoración de interiores y como regalo sofisticado."}
        ]
    },
    {
        "name": "Juguetería Sonrisas",
        "email": "jugueteria@example.com",
        "password": "jugueteria123",
        "category": "Juguetería",
        "products": [
            {"name": "Muñeca", "price": 14.99, "stock": 50, "description": "Muñeca interactiva con vestido colorido, cabello peinable y accesorios incluidos. Estimula la imaginación y el juego creativo en niñas de 3 a 8 años."},
            {"name": "Carrito", "price": 9.99, "stock": 60, "description": "Carrito de juguete resistente con ruedas funcionales y diseño realista. Perfecto para juegos de rol, desarrolla habilidades motoras y imaginación en niños."},
            {"name": "Rompecabezas", "price": 7.99, "stock": 70, "description": "Rompecabezas de 500 piezas con imagen colorida y educativa. Desarrolla paciencia, concentración y habilidades cognitivas. Diversión para toda la familia."}
        ]
    },
    {
        "name": "Miscelánea TodoEnUno",
        "email": "miscelanea@example.com",
        "password": "miscelanea123",
        "category": "Miscelánea",
        "products": [
            {"name": "Baterías", "price": 3.99, "stock": 100, "description": "Baterías alcalinas AA de larga duración para dispositivos electrónicos, juguetes, controles remotos y linternas. Pack de 4 unidades de alta calidad."},
            {"name": "Linterna", "price": 6.99, "stock": 40, "description": "Linterna LED resistente con haz de luz potente y mango ergonómico. Ideal para emergencias, camping, trabajo nocturno y actividades al aire libre."},
            {"name": "Pegamento", "price": 2.50, "stock": 80, "description": "Pegamento universal de secado rápido para papel, cartón, tela y materiales porosos. Ideal para manualidades, reparaciones domésticas y proyectos escolares."}
        ]
    }
]


merchant_collection = db["Merchants"]
store_collection = db["Stores"]
product_collection = db["Products"]



with open("store_credentials.txt", "w", encoding="utf-8") as cred_file:
    for store in stores:
        # Hash the password using official bcrypt for .NET BCrypt.Net compatibility
        password_bytes = store["password"][:72].encode("utf-8")
        salt = bcrypt.gensalt(rounds=12)
        password_hash = bcrypt.hashpw(password_bytes, salt).decode("utf-8")
        # Insert merchant (no store fields)
        merchant = {
            "Name": store["name"],
            "Email": store["email"],
            "PasswordHash": password_hash,
            "State": "active"
        }
        merchant_id = merchant_collection.insert_one(merchant).inserted_id

        # Insert store for merchant
        store_doc = {
            "MerchantId": str(merchant_id),
            "Name": store["name"],
            "StoreSlug": store["name"].lower().replace(" ", "-"),
            "Category": store.get("category", ""),
            "Address": "",
            "Phone": "555-123-4567",
            "State": "active",
            "IsActive": True
        }
        store_id = store_collection.insert_one(store_doc).inserted_id

        # Insert products for store
        for prod in store["products"]:
            product = {
                "Name": prod["name"],
                "Price": prod["price"],
                "Stock": prod["stock"],
                "StoreId": str(store_id),
                "IsDeleted": False,
                "Description": prod.get("description", ""),
                "Images": [],
                "CoverIndex": 0
            }
            product_collection.insert_one(product)

        # Write credentials
        cred_file.write(f"Email: {store['email']}, Password: {store['password']}\n")

print("Stores and products seeded. Credentials saved to store_credentials.txt.")
