// ===== CHATBOT FUNCTIONALITY =====
const chatBtn = document.getElementById('chatbotBtn');
const chatWindow = document.getElementById('chatbotWindow');
const closeChat = document.getElementById('closeChat');
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatBody = document.getElementById('chatBody');
const typingIndicator = document.getElementById('typingIndicator');

// Toggle chatbot
chatBtn.onclick = () => {
    chatWindow.style.display = 'flex';
    userInput.focus();
};

closeChat.onclick = () => {
    chatWindow.style.display = 'none';
};

// Send button and Enter key handling for chatbot
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Send message function
function sendMessage() {
    const msg = userInput.value.trim();
    if (!msg) return;

    // Add user message
    addUserMessage(msg);
    userInput.value = "";

    // Show typing indicator
    typingIndicator.style.display = 'flex';

    // Get bot response after delay
    setTimeout(() => {
        typingIndicator.style.display = 'none';
        const response = getBotResponse(msg.toLowerCase());
        addBotMessage(response);
    }, 1000 + Math.random() * 1000);
}
// Add bot message to chat (accepts string or { text, product })
function addBotMessage(response) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'bot-message';

    if (typeof response === 'string') {
        messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <p>${response}</p>
        </div>
      `;
    } else if (response && typeof response === 'object') {
        const text = response.text || '';
        messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <p>${text}</p>
        </div>
      `;

        // If there's a product attached, add a Buy button
        if (response.product && response.product.name) {
            const buyBtn = document.createElement('button');
            buyBtn.className = 'chat-buy-btn';
            buyBtn.textContent = `Buy ${response.product.name}`;
            buyBtn.onclick = () => showBuyOptions(response.product);
            messageDiv.querySelector('.message-content').appendChild(buyBtn);
        }
    }

    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Simple bot response logic that consults PRODUCT_LOOKUP
function getBotResponse(msg) {
    // Basic intents
    const buyKeywords = ['buy', 'purchase', 'where to buy', "i want", 'order', 'get'];

    // Try to find a product mentioned in the message (best-effort substring match)
    const foundKey = Object.keys(PRODUCT_LOOKUP).find(key => msg.includes(key));
    if (foundKey) {
        const product = PRODUCT_LOOKUP[foundKey];
        // If user asked to buy, return product with buy button
        if (buyKeywords.some(k => msg.includes(k))) {
            return {
                text: `I found "${product.name}" — I can open marketplace options for you. Click Buy to continue.`,
                product
            };
        }

        // Otherwise offer info and a buy button
        return {
            text: `"${product.name}": ${product.description} — Price: ₹${product.price.toLocaleString('en-IN')}. Want to buy?`,
            product
        };
    }

    // Fallback responses
    if (msg.includes('help') || msg.includes('how')) {
        return 'I can help you find student gear and direct you to marketplaces (Amazon/Flipkart). Ask me about any product or branch.';
    }

    if (msg.includes('catalog') || msg.includes('products') || msg.includes('list')) {
        return 'Tell me a branch (CSE, ECE, MECH, CIVIL, EEE, AI, BIO, CHEM, IS, AUTO) or mention a product name and I will help you find it.';
    }

    return "I'm here to help — mention a product name or say 'buy' followed by the product and I'll show options.";
}


// Add user message to chat
function addUserMessage(msg) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.innerHTML = `
    <div class="message-avatar">👤</div>
    <div class="message-content">
      <p>${msg}</p>
    </div>
  `;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}
const PRODUCTS_BY_BRANCH = {
    // Populated branches (CSE/ECE/MECH/CIVIL/EEE) - ~10 items each for initial catalog
    'CSE': [
        { name: 'Student Developer Laptop', price: 54999, image: '💻', description: 'Lightweight laptop for coding and projects.', badge: 'Laptop', category: 'Laptops', aliases: ['laptop', 'developer laptop'] },
        { name: 'Mechanical Keyboard', price: 3799, image: '⌨️', description: 'Tactile mechanical keyboard for fast typing.', badge: 'Accessory', aliases: ['keyboard', 'mechanical keyboard'], affiliates: { amazon: 'https://amzn.to/3XiWIuU' }, amazonLink: 'https://amzn.to/3XiWIuU' },
        { name: 'USB-C Hub', price: 1299, image: '🔌', description: 'Multiport USB-C hub for extra ports.', badge: 'Accessory', aliases: ['hub', 'usb hub'] },
        { name: 'Portable SSD 1TB', price: 6999, image: '💾', description: 'Fast NVMe portable SSD for datasets.', badge: 'Storage', aliases: ['ssd', 'portable ssd'] },
        { name: 'Noise Cancelling Headset', price: 4999, image: '🎧', description: 'Headset for focus and online labs.', badge: 'Audio', aliases: ['headset', 'earphones'] },
        { name: 'Raspberry Pi 4 Kit', price: 5999, image: '🍓', description: 'Complete Raspberry Pi kit for projects.', badge: 'Kit', aliases: ['raspberry pi', 'pi kit'], affiliates: { amazon: 'https://www.amazon.in/dp/B07TD42S27' } },
        { name: 'External Monitor 24"', price: 11999, image: '🖥️', description: '24 inch IPS monitor for coding.', badge: 'Display', aliases: ['monitor', 'display'] },
        { name: 'Laptop Cooling Pad', price: 799, image: '🧊', description: 'Keep your laptop cool under load.', badge: 'Accessory', aliases: ['cooling pad'] },
        { name: 'USB Debugger', price: 2499, image: '🔍', description: 'USB debugging tool for embedded dev.', badge: 'Tool', aliases: ['debugger'] },
        { name: 'Webcam 1080p', price: 2499, image: '📷', description: 'HD webcam for online classes.', badge: 'Accessory', aliases: ['webcam'] },
        { name: 'Casio FX-991CW', price: 1529, image: '🔢', description: 'Casio scientific calculator FX-991CW — reliable for exams and labs.', badge: 'Calculator', aliases: ['casio', 'fx-991cw'], affiliates: { amazon: 'https://amzn.to/3Xf9YAN' }, amazonLink: 'https://amzn.to/3Xf9YAN' },
        // Popular books useful for students
        { name: 'Atomic Habits', price: 799, image: '📘', description: 'Atomic Habits by James Clear — practical strategies to build good habits and break bad ones.', badge: 'Book', aliases: ['atomic habits', 'atomic', 'james clear'], affiliates: { amazon: 'https://amzn.to/4ad4Jci' }, amazonLink: 'https://amzn.to/4ad4Jci' },
        // --- CSE Laptops (extended to ~30 items) ---
        { name: 'Lenovo SlimPad 5i', price: 55999, image: '💻', description: 'SlimPad 5i — ultralight for students.', badge: 'Laptop', category: 'Laptops', aliases: ['lenovo slimpad', 'slimpad 5i'], affiliates: { amazon: 'https://www.amazon.in/dp/B0EXAMPLELENOVO', flipkart: 'https://www.flipkart.com/item/lenovo-slimpad-5i' }, amazonLink: 'https://www.amazon.in/dp/B0EXAMPLELENOVO', flipkartLink: 'https://www.flipkart.com/item/lenovo-slimpad-5i' },
        { name: 'Dell Inspiron 15', price: 45999, image: '💻', description: 'Dell Inspiron series, reliable for study.', badge: 'Laptop', category: 'Laptops', aliases: ['dell inspiron'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPDELL1', flipkartLink: 'https://www.flipkart.com/item/dell-inspiron-15' },
        { name: 'HP Pavilion X360', price: 49999, image: '💻', description: 'Convertible Pavilion for note-taking.', badge: 'Laptop', category: 'Laptops', aliases: ['hp pavilion'], imageUrl: 'assets/hp pevilian.jpeg.jpg', amazonLink: 'https://amzn.to/488WECM', flipkartLink: 'https://www.flipkart.com/item/hp-pavilion-x360' },
        { name: 'Asus VivoBook 14', price: 38999, image: '💻', description: 'Compact VivoBook for everyday coding.', badge: 'Laptop', category: 'Laptops', aliases: ['asus vivobook'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPASUS1', flipkartLink: 'https://www.flipkart.com/item/asus-vivobook-14' },
        { name: 'Acer Aspire 5', price: 34999, image: '💻', description: 'Affordable Aspire for students.', badge: 'Laptop', category: 'Laptops', aliases: ['acer aspire'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPACER1', flipkartLink: 'https://www.flipkart.com/item/acer-aspire-5' },
        { name: 'Microsoft Surface Go', price: 64999, image: '💻', description: 'Surface Go for light development on the go.', badge: 'Laptop', category: 'Laptops', aliases: ['surface go'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPMSFT1', flipkartLink: 'https://www.flipkart.com/item/surface-go' },
        { name: 'Lenovo IdeaPad 3', price: 32999, image: '💻', description: 'IdeaPad for budget-conscious students.', badge: 'Laptop', category: 'Laptops', aliases: ['ideapad'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPLENOVO2', flipkartLink: 'https://www.flipkart.com/item/lenovo-ideapad-3' },
        { name: 'HP Envy 13', price: 75999, image: '💻', description: 'Premium HP Envy for power users.', badge: 'Laptop', category: 'Laptops', aliases: ['hp envy'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPHP2', flipkartLink: 'https://www.flipkart.com/item/hp-envy-13' },
        { name: 'Asus ROG Flow', price: 119999, image: '💻', description: 'Gaming-grade ROG for ML/graphics.', badge: 'Laptop', category: 'Laptops', aliases: ['rog flow'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPASUS2', flipkartLink: 'https://www.flipkart.com/item/asus-rog-flow' },
        { name: 'Dell XPS 13', price: 129999, image: '💻', description: 'XPS — compact premium ultrabook.', badge: 'Laptop', category: 'Laptops', aliases: ['xps 13'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPDELL2', flipkartLink: 'https://www.flipkart.com/item/dell-xps-13' },
        { name: 'MacBook Air M2', price: 124900, image: '💻', description: 'MacBook Air with M2 chip — great battery life.', badge: 'Laptop', category: 'Laptops', aliases: ['macbook air'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPAPPLE1', flipkartLink: 'https://www.flipkart.com/item/macbook-air-m2' },
        { name: 'Samsung Galaxy Book', price: 67999, image: '💻', description: 'Galaxy Book for thin-and-light performance.', badge: 'Laptop', category: 'Laptops', aliases: ['galaxy book'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPSAMSUNG1', flipkartLink: 'https://www.flipkart.com/item/samsung-galaxy-book' },
        { name: 'Acer Swift 3', price: 45999, image: '💻', description: 'Swift 3 — balanced performance.', badge: 'Laptop', category: 'Laptops', aliases: ['swift 3'], amazonLink: 'https://www.amazon.in/dp/B0EXAMPACER2', flipkartLink: 'https://www.flipkart.com/item/acer-swift-3' },
        { name: 'Asus ZenBook 14', price: 89999, image: '💻', description: 'ZenBook — stylish and portable.', badge: 'Laptop', category: 'Laptops', aliases: ['zenbook'] },
        { name: 'Razer Blade Stealth', price: 139999, image: '💻', description: 'Razer Blade for premium performance.', badge: 'Laptop', category: 'Laptops', aliases: ['razer blade'] },
        { name: 'Lenovo Legion Slim', price: 109999, image: '💻', description: 'Legion Slim — for engineering students needing GPU.', badge: 'Laptop', category: 'Laptops', aliases: ['legion slim'] },
        { name: 'HP Omen 16', price: 95999, image: '💻', description: 'Omen — workstation-grade for simulations.', badge: 'Laptop', category: 'Laptops', aliases: ['hp omen'] },
        { name: 'Dell G15', price: 79999, image: '💻', description: 'G15 gaming laptop for heavy workloads.', badge: 'Laptop', category: 'Laptops', aliases: ['g15'] },
        { name: 'Asus TUF Gaming', price: 64999, image: '💻', description: 'TUF — durable gaming laptop.', badge: 'Laptop', category: 'Laptops', aliases: ['tuf gaming'] },
        { name: 'MSI Modern 14', price: 47999, image: '💻', description: 'MSI Modern for creators and students.', badge: 'Laptop', category: 'Laptops', aliases: ['msi modern'] },
        { name: 'LG Gram 14', price: 99999, image: '💻', description: 'LG Gram — ultra-lightweight long battery life.', badge: 'Laptop', category: 'Laptops', aliases: ['lg gram'] },
        { name: 'Huawei MateBook D', price: 42999, image: '💻', description: 'MateBook D — value for specs.', badge: 'Laptop', category: 'Laptops', aliases: ['matebook'] },
        { name: 'Chromebook Plus', price: 21999, image: '💻', description: 'Chromebook for cloud-first students.', badge: 'Laptop', category: 'Laptops', aliases: ['chromebook'] },
        { name: 'Google Pixelbook', price: 89999, image: '💻', description: 'Pixelbook for Android/Chrome integration.', badge: 'Laptop', category: 'Laptops', aliases: ['pixelbook'] },
        { name: 'Toshiba Dynabook', price: 39999, image: '💻', description: 'Dynabook — reliable performance.', badge: 'Laptop', category: 'Laptops', aliases: ['dynabook'] }
    ],
    'ECE': [
        { name: 'Oscilloscope Mini', price: 8999, image: '📊', description: 'Digital oscilloscope for labs.', badge: 'Instrument', aliases: ['oscilloscope', 'scope'], affiliates: { flipkart: 'https://www.flipkart.com/search?q=oscilloscope' } },
        { name: 'Breadboard Kit', price: 1299, image: '🔌', description: 'Complete breadboard and jumper kit.', badge: 'Kit', aliases: ['breadboard', 'kit'] },
        { name: 'Soldering Station', price: 3999, image: '🔥', description: 'Professional soldering station.', badge: 'Tool', aliases: ['soldering', 'soldering iron'] },
        { name: 'Function Generator', price: 4999, image: '📈', description: 'Signal generator for lab experiments.', badge: 'Instrument', aliases: ['function generator'] },
        { name: 'Multimeter Pro', price: 1999, image: '🧰', description: 'Digital multimeter for measurement.', badge: 'Tool', aliases: ['multimeter'] },
        { name: 'FPGA Starter Kit', price: 10999, image: '🔧', description: 'FPGA board for digital design.', badge: 'Board', aliases: ['fpga'] },
        { name: 'Electronic Components Pack', price: 899, image: '📦', description: 'Resistors, capacitors and more.', badge: 'Parts', aliases: ['components'] },
        { name: 'Power Supply Bench', price: 6999, image: '🔋', description: 'Adjustable bench power supply.', badge: 'Equipment', aliases: ['power supply'] },
        { name: 'PCB Fabrication Kit', price: 7999, image: '📐', description: 'Tools for small PCB manufacturing.', badge: 'Manufacturing', aliases: ['pcb', 'fabrication'] },
        { name: 'Surface Mount Kit', price: 2999, image: '🧩', description: 'SMT kit for surface mount projects.', badge: 'Kit', aliases: ['smt', 'surface mount'] }
    ],
    'MECH': [
        { name: '3D Printer', price: 34999, image: '🖨️', description: 'Entry-level 3D printer for prototyping.', badge: 'Fabrication', aliases: ['3d printer', 'printer'], affiliates: { amazon: 'https://www.amazon.in/s?k=3d+printer' } },
        { name: 'Caliper Digital', price: 1999, image: '📏', description: 'High-precision digital caliper.', badge: 'Tool', aliases: ['caliper'] },
        { name: 'Lathe Training Kit', price: 12999, image: '⚙️', description: 'Small lathe kit for learning machining.', badge: 'Lab', aliases: ['lathe'] },
        { name: 'CAD Workstation', price: 79999, image: '💻', description: 'Workstation for CAD/CAM workflows.', badge: 'Workstation', aliases: ['cad workstation'] },
        { name: 'Hand Tool Set', price: 4999, image: '🔧', description: 'Comprehensive workshop toolset.', badge: 'Workshop', aliases: ['tools', 'hand tool'] },
        { name: 'Bearing Kit', price: 499, image: '🔩', description: 'Assorted bearings for projects.', badge: 'Parts', aliases: ['bearing'] },
        { name: 'Transmission Model', price: 8999, image: '🚗', description: 'Cutaway transmission model for study.', badge: 'Model', aliases: ['transmission'] },
        { name: 'CNC Router', price: 45999, image: '🛠️', description: 'Desktop CNC for small parts.', badge: 'Fabrication', aliases: ['cnc'] },
        { name: 'Welding Helmet', price: 2999, image: '🪖', description: 'Auto-darkening welding helmet.', badge: 'Safety', aliases: ['welding'] },
        { name: 'Strain Gauge Kit', price: 6999, image: '📐', description: 'Strain measurement instrumentation.', badge: 'Instrumentation', aliases: ['strain gauge'] }
    ],
    'CIVIL': [
        { name: 'Total Station Lite', price: 45999, image: '📡', description: 'Surveying instrument for fieldwork.', badge: 'Instrument', aliases: ['total station', 'survey'] },
        { name: 'Concrete Test Kit', price: 7999, image: '🏗️', description: 'Kits for concrete strength tests.', badge: 'Lab', aliases: ['concrete test'] },
        { name: 'AutoCAD Civil Course', price: 3999, image: '📚', description: 'Course materials for civil drafting.', badge: 'Course', aliases: ['autocad'] },
        { name: 'Soil Testing Kit', price: 12999, image: '🧪', description: 'Tools for geotechnical testing.', badge: 'Lab', aliases: ['soil test'] },
        { name: 'Topographic Map Kit', price: 1499, image: '🗺️', description: 'Tools for map-making and surveys.', badge: 'Tool', aliases: ['map kit'] },
        { name: 'Rebar Cutter', price: 8999, image: '🔧', description: 'Manual rebar cutting tool.', badge: 'Tool', aliases: ['rebar cutter'] },
        { name: 'Concrete Mixer Mini', price: 15999, image: '🧱', description: 'Small mixer for lab-scale concrete.', badge: 'Equipment', aliases: ['mixer'] },
        { name: 'Structural Analysis Software', price: 19999, image: '💻', description: 'Software for structural simulations.', badge: 'Software', aliases: ['structural software'] },
        { name: 'Survey Tripod', price: 1999, image: '📏', description: 'Tripod for surveying instruments.', badge: 'Accessory', aliases: ['tripod'] },
        { name: 'Leveling Staff', price: 999, image: '📐', description: 'Staff for optical leveling.', badge: 'Tool', aliases: ['leveling staff'] }
    ],
    'EEE': [
        { name: 'Circuit Design Suite', price: 4999, image: '💻', description: 'Circuit design and simulation software.', badge: 'Software', aliases: ['circuit', 'simulation'] },
        { name: 'Motor Control Kit', price: 7999, image: '🔄', description: 'Motor control experimentation kit.', badge: 'Kit', aliases: ['motor kit'] },
        { name: 'Protection Equipment', price: 3499, image: '🔒', description: 'Electrical safety gear.', badge: 'Safety', aliases: ['safety'] },
        { name: 'Power Quality Analyzer', price: 45999, image: '📊', description: 'Power quality measurement system.', badge: 'Analyzer', aliases: ['power quality'] },
        { name: 'High Voltage Kit', price: 29999, image: '⚡', description: 'High voltage testing kit.', badge: 'HV', aliases: ['high voltage'] },
        { name: 'PLC Training System', price: 34999, image: '🤖', description: 'PLC training system with software.', badge: 'Industrial', aliases: ['plc'] },
        { name: 'Energy Meter Kit', price: 12999, image: '⚡', description: 'Smart energy meter testing kit.', badge: 'Meter', aliases: ['energy meter'] },
        { name: 'Transformer Lab', price: 24999, image: '🔌', description: 'Transformer testing setup.', badge: 'Lab', aliases: ['transformer'] },
        { name: 'Solar Power Kit', price: 18999, image: '☀️', description: 'Solar system testing kit.', badge: 'Renewable', aliases: ['solar kit'] },
        { name: 'Control System Lab', price: 39999, image: '🎛️', description: 'Control systems laboratory setup.', badge: 'Controls', aliases: ['control system'] }
    ],
    'AI': [
        {
            name: 'NVIDIA GPU Laptop',
            price: 149999,
            image: '💻',
            description: 'RTX 4060 powered laptop for ML/AI development.',
            badge: 'ML Ready'
        },
        {
            name: 'AI Development Kit',
            price: 12999,
            image: '🤖',
            description: 'Complete AI/ML development kit with hardware modules.',
            badge: 'Advanced'
        },
        {
            name: 'Deep Learning Course',
            price: 3999,
            image: '📚',
            description: 'Comprehensive deep learning and AI course materials.',
            badge: 'Bestseller'
        },
        {
            name: 'Cloud Credits Pack',
            price: 5000,
            image: '☁️',
            description: 'Cloud computing credits for AI model training.',
            badge: 'Essential'
        },
        {
            name: 'GPU Server Access',
            price: 29999,
            image: '🖥️',
            description: 'Dedicated GPU server access for model training.',
            badge: 'Pro'
        },
        {
            name: 'Data Science Bundle',
            price: 7999,
            image: '📊',
            description: 'Complete data science and analytics course package.',
            badge: 'Learning'
        },
        {
            name: 'Neural Processing Unit',
            price: 89999,
            image: '🧠',
            description: 'Dedicated neural processing hardware for AI.',
            badge: 'Hardware'
        },
        {
            name: 'ML Framework Bundle',
            price: 4999,
            image: '🛠️',
            description: 'Popular ML frameworks with premium support.',
            badge: 'Tools'
        },
        {
            name: 'AI Research Papers',
            price: 1999,
            image: '📑',
            description: 'Collection of latest AI research papers and analyses.',
            badge: 'Research'
        },
        {
            name: 'Computer Vision Kit',
            price: 15999,
            image: '👁️',
            description: 'Hardware and software for computer vision projects.',
            badge: 'Vision'
        },
        {
            name: 'NLP Tools Bundle',
            price: 8999,
            image: '💬',
            description: 'Natural Language Processing tools and resources.',
            badge: 'NLP'
        },
        {
            name: 'AI Ethics Course',
            price: 2999,
            image: '⚖️',
            description: 'Comprehensive course on AI ethics and governance.',
            badge: 'Ethics'
        }
    ],
    'BIO': [
        {
            name: 'Digital Microscope',
            price: 29999,
            image: '🔬',
            description: 'HD digital microscope with video recording.',
            badge: 'Lab Grade'
        },
        {
            name: 'Lab Equipment Set',
            price: 15999,
            image: '🧪',
            description: 'Complete biotech lab equipment starter kit.',
            badge: 'Starter Kit'
        },
        {
            name: 'Safety Cabinet',
            price: 49999,
            image: '🏥',
            description: 'Biological safety cabinet for lab work.',
            badge: 'Pro Lab'
        },
        {
            name: 'Research Software',
            price: 8999,
            image: '💻',
            description: 'Biotechnology research and analysis software.',
            badge: 'Research'
        },
        {
            name: 'PCR Machine',
            price: 89999,
            image: '🧬',
            description: 'Professional PCR machine for DNA amplification.',
            badge: 'DNA Lab'
        },
        {
            name: 'Cell Culture Kit',
            price: 24999,
            image: '🦠',
            description: 'Complete cell culture equipment and supplies.',
            badge: 'Culture'
        },
        {
            name: 'Spectrophotometer',
            price: 34999,
            image: '📊',
            description: 'UV-Vis spectrophotometer for analysis.',
            badge: 'Analysis'
        },
        {
            name: 'Centrifuge Pro',
            price: 45999,
            image: '🌪️',
            description: 'High-speed centrifuge for lab work.',
            badge: 'Essential'
        },
        {
            name: 'Bio Informatics SW',
            price: 12999,
            image: '🧬',
            description: 'Bioinformatics software suite for research.',
            badge: 'Software'
        },
        {
            name: 'Gel Documentation',
            price: 39999,
            image: '📸',
            description: 'Gel documentation system with imaging.',
            badge: 'Imaging'
        },
        {
            name: 'Micropipette Set',
            price: 18999,
            image: '💉',
            description: 'Professional micropipette set with calibration.',
            badge: 'Precision'
        },
        {
            name: 'Lab Incubator',
            price: 29999,
            image: '🌡️',
            description: 'Temperature controlled lab incubator.',
            badge: 'Equipment'
        }
    ],
    'CHEM': [
        {
            name: 'Chemistry Lab Kit',
            price: 24999,
            image: '⚗️',
            description: 'Complete chemistry lab setup with glassware.',
            badge: 'Complete Lab'
        },
        {
            name: 'Safety Equipment',
            price: 7999,
            image: '🧤',
            description: 'Chemical lab safety equipment and gear.',
            badge: 'Safety'
        },
        {
            name: 'Digital Balance',
            price: 12999,
            image: '⚖️',
            description: 'High-precision digital analytical balance.',
            badge: 'Precision'
        },
        {
            name: 'Molecular Model Kit',
            price: 1999,
            image: '🔮',
            description: 'Advanced molecular modeling kit for chemistry.',
            badge: 'Learning'
        },
        {
            name: 'Distillation Setup',
            price: 34999,
            image: '🧪',
            description: 'Professional distillation apparatus set.',
            badge: 'Pro Lab'
        },
        {
            name: 'pH Meter Pro',
            price: 8999,
            image: '📊',
            description: 'Digital pH meter with calibration kit.',
            badge: 'Analysis'
        },
        {
            name: 'Titration Station',
            price: 19999,
            image: '💧',
            description: 'Automated titration system with sensors.',
            badge: 'Auto'
        },
        {
            name: 'HPLC System',
            price: 149999,
            image: '📈',
            description: 'High-performance liquid chromatography system.',
            badge: 'Advanced'
        },
        {
            name: 'Chemical Storage',
            price: 29999,
            image: '🗄️',
            description: 'Safe chemical storage cabinet system.',
            badge: 'Storage'
        },
        {
            name: 'Reaction Kit Pro',
            price: 15999,
            image: '🧫',
            description: 'Advanced organic chemistry reaction kit.',
            badge: 'Organic'
        },
        {
            name: 'Spectrometer',
            price: 89999,
            image: '🌈',
            description: 'Research-grade spectrometer for analysis.',
            badge: 'Research'
        },
        {
            name: 'Data Logger Kit',
            price: 12999,
            image: '📱',
            description: 'Digital data logging system for experiments.',
            badge: 'Digital'
        }
    ],
    'IS': [
        {
            name: 'Developer Laptop',
            price: 89999,
            image: '💻',
            description: 'High-performance laptop for development and VM.',
            badge: 'Dev Ready'
        },
        {
            name: 'Network Lab Kit',
            price: 15999,
            image: '🌐',
            description: 'Complete networking lab setup with routers.',
            badge: 'Lab Kit'
        },
        {
            name: 'Security Suite',
            price: 4999,
            image: '🔒',
            description: 'Cybersecurity tools and learning resources.',
            badge: 'Security'
        },
        {
            name: 'Cloud Computing Pack',
            price: 7999,
            image: '☁️',
            description: 'Cloud platform credits and learning resources.',
            badge: 'Cloud Ready'
        },
        {
            name: 'Server Hardware Kit',
            price: 54999,
            image: '🖥️',
            description: 'Enterprise server setup for hosting and testing.',
            badge: 'Enterprise'
        },
        {
            name: 'Database Course',
            price: 3999,
            image: '📚',
            description: 'Advanced database management course.',
            badge: 'Learning'
        },
        {
            name: 'DevOps Tools Pack',
            price: 12999,
            image: '🛠️',
            description: 'Complete DevOps tool suite and training.',
            badge: 'DevOps'
        },
        {
            name: 'Mobile Dev Kit',
            price: 8999,
            image: '📱',
            description: 'Mobile app development tools and resources.',
            badge: 'Mobile'
        },
        {
            name: 'Penetration Test Kit',
            price: 19999,
            image: '🔍',
            description: 'Professional penetration testing tools.',
            badge: 'Security'
        },
        {
            name: 'Project Management SW',
            price: 6999,
            image: '📊',
            description: 'Project management and agile tools.',
            badge: 'Management'
        },
        {
            name: 'UI/UX Design Suite',
            price: 9999,
            image: '🎨',
            description: 'Complete UI/UX design software bundle.',
            badge: 'Design'
        },
        {
            name: 'API Testing Tools',
            price: 5999,
            image: '🔧',
            description: 'Professional API testing and documentation tools.',
            badge: 'Testing'
        }
    ],
    'AUTO': [
        {
            name: 'Diagnostics Kit',
            price: 34999,
            image: '🚗',
            description: 'Professional automotive diagnostic equipment.',
            badge: 'Pro Tool'
        },
        {
            name: 'CAD Workstation',
            price: 79999,
            image: '💻',
            description: 'Powerful workstation for automotive design.',
            badge: 'Design Station'
        },
        {
            name: 'Engine Study Kit',
            price: 19999,
            image: '⚙️',
            description: 'Cutaway engine models for learning.',
            badge: 'Learning'
        },
        {
            name: 'Workshop Tools',
            price: 12999,
            image: '🔧',
            description: 'Complete set of automotive workshop tools.',
            badge: 'Tool Kit'
        },
        {
            name: 'Emission Analyzer',
            price: 45999,
            image: '💨',
            description: 'Professional emission testing equipment.',
            badge: 'Emissions'
        },
        {
            name: 'Chassis Simulator',
            price: 89999,
            image: '🚙',
            description: 'Advanced chassis dynamics simulation system.',
            badge: 'Simulation'
        },
        {
            name: 'Electric Vehicle Kit',
            price: 29999,
            image: '⚡',
            description: 'EV systems study and testing equipment.',
            badge: 'EV Tech'
        },
        {
            name: 'Transmission Lab',
            price: 34999,
            image: '⚙️',
            description: 'Transmission systems study and repair kit.',
            badge: 'Drivetrain'
        },
        {
            name: 'Paint Shop Kit',
            price: 24999,
            image: '🎨',
            description: 'Automotive painting and finishing equipment.',
            badge: 'Finishing'
        },
        {
            name: 'Suspension Analysis',
            price: 39999,
            image: '🔩',
            description: 'Suspension geometry analysis tools.',
            badge: 'Analysis'
        },
        {
            name: 'Hybrid Tech Kit',
            price: 49999,
            image: '🔋',
            description: 'Hybrid vehicle technology training system.',
            badge: 'Hybrid'
        },
        {
            name: 'Body Work Tools',
            price: 18999,
            image: '🛠️',
            description: 'Complete auto body repair tool set.',
            badge: 'Body Work'
        }
    ]
};

function getBranchProducts(branch) {
    return PRODUCTS_BY_BRANCH[branch] || [];
}

// Affiliate link management
const affiliateManager = {
    // Store affiliate links separately from products
    affiliateLinks: new Map(),

    // Update affiliate links for a product
    updateAffiliateLinks(productName, links) {
        this.affiliateLinks.set(productName.toLowerCase(), links);
    },

    // Get affiliate links for a product
    getAffiliateLinks(productName) {
        const links = this.affiliateLinks.get(productName.toLowerCase());
        if (links) return links;

        // Default search URLs if no specific links exist
        const encodedName = encodeURIComponent(productName);
        return {
            amazon: `https://www.amazon.in/s?k=${encodedName}`,
            flipkart: `https://www.flipkart.com/search?q=${encodedName}`
        };
    },

    // Update multiple products at once
    bulkUpdateAffiliateLinks(updates) {
        for (const [productName, links] of Object.entries(updates)) {
            this.updateAffiliateLinks(productName, links);
        }
    }
};

// Register quick affiliate overrides for specific featured products
// (added: Casio FX-991CW — affiliate shortlink provided by user)
affiliateManager.updateAffiliateLinks('Casio FX-991CW', { amazon: 'https://amzn.to/4rnIiqW' });
// Also register a variant with the special character typo that appears in the markup
affiliateManager.updateAffiliateLinks('Casi₹o FX-991CW', { amazon: 'https://amzn.to/4rnIiqW' });

// Build a quick lookup of products by lowercase name for chatbot/product search
// Utility: levenshtein distance for fuzzy matching
function levenshtein(a, b) {
    if (!a || !b) return Infinity;
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
            else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
    }
    return matrix[b.length][a.length];
}

// Build a quick lookup of products by lowercase name for chatbot/product search
const PRODUCT_LOOKUP = (function buildProductLookup() {
    const map = {};
    Object.values(PRODUCTS_BY_BRANCH).flat().forEach(p => {
        if (p && p.name) {
            // If product contains an affiliates object, keep it but also
            // normalise into explicit amazonLink / flipkartLink on the product
            // so product-level links exist (preferred by buyProduct).
            if (p.affiliates) {
                // update centralized manager for fallback usage
                affiliateManager.updateAffiliateLinks(p.name, p.affiliates);
                if (p.affiliates.amazon) p.amazonLink = p.affiliates.amazon;
                if (p.affiliates.flipkart) p.flipkartLink = p.affiliates.flipkart;
                // don't delete p.affiliates — keep the raw data available
            }

            // Ensure an imageUrl exists (use placeholder if not provided)
            if (!p.imageUrl) {
                p.imageUrl = 'assets/placeholder.svg';
            }

            map[p.name.toLowerCase()] = p;
            // include aliases in lookup map
            if (Array.isArray(p.aliases)) {
                p.aliases.forEach(a => map[a.toLowerCase()] = p);
            }
        }
    });
    return map;
})();

// Enhanced product search with smarter matching and ranking
function findProducts(query) {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/); // Split into individual terms

    // Get unique products
    const list = Object.values(PRODUCT_LOOKUP);
    const unique = Array.from(new Set(list));

    // Score and rank matches
    const scored = unique.map(p => {
        let score = 0;
        const name = p.name.toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const badge = (p.badge || '').toLowerCase();
        const aliases = (p.aliases || []).map(a => a.toLowerCase());

        // Process each search term
        terms.forEach(term => {
            // Exact matches (highest priority)
            if (name === term || aliases.includes(term)) score += 100;
            if (category === term || badge === term) score += 80;

            // Word boundary matches
            const wordBoundaryRegex = new RegExp(`\\b${term}\\b`);
            if (wordBoundaryRegex.test(name)) score += 70;
            if (wordBoundaryRegex.test(desc)) score += 40;

            // Substring matches
            if (name.includes(term)) score += 60;
            if (category.includes(term) || badge.includes(term)) score += 50;
            if (desc.includes(term)) score += 30;

            // Price range matches
            if (term.includes('under') || term.includes('below')) {
                const priceMatch = term.match(/\d+/);
                if (priceMatch && p.price <= parseInt(priceMatch[0])) {
                    score += 45;
                }
            }

            // Special category keywords
            const specialCategories = {
                'cheap': (p) => p.price < 5000,
                'expensive': (p) => p.price > 50000,
                'affordable': (p) => p.price < 15000,
                'premium': (p) => p.price > 30000,
                'budget': (p) => p.price < 10000
            };

            if (specialCategories[term] && specialCategories[term](p)) {
                score += 40;
            }

            // Fuzzy name match (allow small typos)
            const fuzzyDist = levenshtein(term, name);
            if (fuzzyDist <= Math.max(2, Math.floor(name.length * 0.2))) {
                score += Math.max(0, 40 - fuzzyDist * 10);
            }
        });

        // Boost score for products with explicit affiliate links
        if (p.affiliates && Object.keys(p.affiliates).length > 0) {
            score *= 1.1;
        }

        // Recent products boost (if dateAdded exists)
        if (p.dateAdded) {
            const daysAgo = (new Date() - new Date(p.dateAdded)) / (1000 * 60 * 60 * 24);
            if (daysAgo < 30) score *= 1.05;
        }

        // Popular products boost
        if (p.popularity && p.popularity > 500) score *= 1.05;

        return { product: p, score };
    })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.map(x => x.product);
}

// Helper: open an external buy options modal (Amazon / Flipkart search)
function showBuyOptions(product) {
    // Basic validation
    if (!product || !product.name) {
        showNotification('❌ Product information not found');
        return;
    }

    // Clean up any existing modals first
    cleanupModals();

    // Create the modal and backdrop elements
    const modal = document.createElement('div');
    // add a class that tests (and CSS) can target: .buy-options-modal
    modal.className = 'modal-container buy-options-modal';
    modal.setAttribute('data-modal-type', 'buy-options');

    // Get affiliate links from the manager
    const affiliateLinks = affiliateManager.getAffiliateLinks(product.name);
    const amazonUrl = product.amazonLink || product.affiliates?.amazon || affiliateLinks.amazon;
    const flipkartUrl = product.flipkartLink || product.affiliates?.flipkart || affiliateLinks.flipkart;

    // Store active element for focus restoration
    const activeElement = document.activeElement;

    // Create modal HTML with more accessible structure
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modalTitle');

    // Add aria-hidden to main content
    document.querySelector('main')?.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content buy-modal" role="document">
            <div class="modal-header">
                <h3 id="modalTitle">${product.name}</h3>
                <button class="modal-close" aria-label="Close modal" type="button">×</button>
            </div>
            <div class="modal-body">
                <div class="product-details">
                    <div class="product-image" role="img" aria-label="Product image">
                        ${product.image || '📦'}
                    </div>
                    <div class="product-info">
                        <p class="product-price">₹${product.price.toLocaleString('en-IN')}</p>
                        <p class="product-desc">${product.description || ''}</p>
                    </div>
                </div>
                <div class="store-buttons">
                    <a href="${amazonUrl || '#'}" target="_blank" rel="noopener noreferrer" class="buy-link amazon store-btn">
                        <i class="fab fa-amazon"></i> Buy on Amazon
                    </a>
                    <a href="${flipkartUrl || '#'}" target="_blank" rel="noopener noreferrer" class="buy-link flipkart store-btn">
                        <i class="fas fa-shopping-cart"></i> Buy on Flipkart
                    </a>
                </div>
            </div>
        </div>
    `;

    // Add modal to document
    document.body.appendChild(modal);

    // Handle modal closing
    const closeModal = () => {
        modal.classList.add('closing');
        setTimeout(() => {
            if (modal.parentNode) modal.parentNode.removeChild(modal);
        }, 300);
    };

    // Get all focusable elements
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus trap handler
    const handleTabKey = (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    };

    // Event listeners with focus management
    const modalCloseBtn = modal.querySelector('.modal-close');
    modalCloseBtn.addEventListener('click', () => {
        closeModal();
        activeElement?.focus();
    });

    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        closeModal();
        activeElement?.focus();
    });

    // Keyboard event handling
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            activeElement?.focus();
        }
        handleTabKey(e);
    };

    document.addEventListener('keydown', handleKeydown);

    // Allow closing by clicking outside or escape key
    const handleClose = (e) => {
        if (e.type === 'keydown' && e.key !== 'Escape') return;
        if (e.type === 'click' && e.target !== modal) return;
        closeModal();
    };

    modal.addEventListener('click', handleClose);
    document.addEventListener('keydown', handleClose);

    // Force a reflow before adding the visible class for reliable animation
    void modal.offsetHeight;
    modal.classList.add('visible');

    // Clean up event listeners when modal is removed
    modal.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && !modal.classList.contains('visible')) {
            // Remove all event listeners
            document.removeEventListener('keydown', handleKeydown);
            modalCloseBtn.removeEventListener('click', closeModal);
            modal.querySelector('.modal-backdrop').removeEventListener('click', closeModal);

            // Remove modal from state tracking
            modalState.activeModals.delete(modal);

            // Remove aria-hidden from main content
            document.querySelector('main')?.removeAttribute('aria-hidden');
        }
    });
}

function showProducts(branch) {
    const branchNames = {
        'CSE': 'Computer Science',
        'ECE': 'Electronics & Communication',
        'MECH': 'Mechanical',
        'CIVIL': 'Civil',
        'EEE': 'Electrical & Electronics',
        'AI': 'Artificial Intelligence',
        'BIO': 'Biotechnology',
        'CHEM': 'Chemical',
        'IS': 'Information Science',
        'AUTO': 'Automobile'
    };

    const emoji = document.querySelector(`[data-branch="${branch}"] .emoji`).textContent;
    const products = getBranchProducts(branch).slice(); // copy

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'custom-modal branch-products-modal';

    // Build category list (from product.category or badge)
    const categories = Array.from(new Set(products.map(p => p.category || p.badge || 'Other')));

    modal.innerHTML = `
        <div class="modal-header">
            <div class="modal-emoji">${emoji}</div>
            <h2 class="modal-title">${branchNames[branch]} Engineering</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-content">
            <div class="modal-controls">
                <div class="modal-categories"></div>
                <div class="modal-sorting">
                    <label for="sortSelect">Sort:</label>
                    <select id="sortSelect" class="sort-select">
                        <option value="newest">Newest</option>
                        <option value="rating">Best rating</option>
                        <option value="popularity">Most popular</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="name">Name A → Z</option>
                    </select>
                </div>
            </div>
            <div class="branch-products-grid"></div>
            <div class="pagination-controls"></div>
        </div>
    `;

    // Ensure product metadata defaults for sorting
    products.forEach((p, idx) => {
        if (!p.dateAdded) p.dateAdded = new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(); // staggered dates
        if (p.rating == null) p.rating = parseFloat((3 + (idx % 20) * 0.1).toFixed(1));
        if (p.popularity == null) p.popularity = Math.max(1, 1000 - (idx * 3));
    });

    // Sorting helper
    function sortProducts(items, mode) {
        const arr = items.slice();
        switch (mode) {
            case 'newest':
                return arr.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            case 'rating':
                return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'popularity':
                return arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            case 'price-asc':
                return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-desc':
                return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'name':
                return arr.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return arr;
        }
    }

    // Pagination state
    const pageSize = 12;
    let currentPage = 1;
    let currentItems = products.slice();

    // Helper to render products into the grid and attach buy handlers (paged)
    function renderProductsGrid(items, page = 1) {
        const grid = modal.querySelector('.branch-products-grid');
        const start = (page - 1) * pageSize;
        const pageItems = items.slice(start, start + pageSize);

        grid.innerHTML = pageItems.map(product => `
            <div class="branch-product-card" data-aos="fade-up" data-product-id="${product.name}">
                <span class="product-badge">${product.badge || ''}</span>
                <div class="product-image">
                    ${product.imageUrl ? `<img src="${product.imageUrl}" class="product-thumb" alt="${product.name}">` : `<span class="product-emoji">${product.image || '📦'}</span>`}
                </div>
                <div class="product-details">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-meta">⭐ ${product.rating || '—'} • ${new Date(product.dateAdded).toLocaleDateString()}</div>
                    <div class="product-price">₹${(product.price || 0).toLocaleString('en-IN')}</div>
                    <button class="buy-now-btn" 
                            onclick="event.preventDefault(); event.stopPropagation();"
                            aria-label="Buy ${product.name}">
                        Buy Now
                    </button>
                </div>
            </div>
        `).join('');

        // Attach buy handlers
        grid.querySelectorAll('.buy-now-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = e.target.closest('.branch-product-card');
                const productName = card.querySelector('.product-name').textContent;
                const product = PRODUCT_LOOKUP[productName.toLowerCase()];
                if (product) {
                    showBuyOptions(product);
                } else {
                    showNotification(`🛒 ${productName} selected.`);
                }
            };
        });

        renderPagination(items, page);
    }

    function renderPagination(items, page) {
        const pc = modal.querySelector('.pagination-controls');
        const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
        pc.innerHTML = `
            <div class="pagination">
                <button class="page-prev" ${page <= 1 ? 'disabled' : ''}>&larr; Prev</button>
                <span class="page-info">Page ${page} of ${totalPages}</span>
                <button class="page-next" ${page >= totalPages ? 'disabled' : ''}>Next &rarr;</button>
            </div>
        `;

        pc.querySelector('.page-prev').onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderProductsGrid(currentItems, currentPage);
                modal.querySelector('.branch-products-grid').scrollIntoView({ behavior: 'smooth' });
            }
        };
        pc.querySelector('.page-next').onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderProductsGrid(currentItems, currentPage);
                modal.querySelector('.branch-products-grid').scrollIntoView({ behavior: 'smooth' });
            }
        };
    }

    // Render category buttons
    const catContainer = modal.querySelector('.modal-categories');
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'All';
    catContainer.appendChild(allBtn);

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat;
        catContainer.appendChild(btn);
    });

    // Category button click handler
    catContainer.addEventListener('click', (e) => {
        if (!e.target.matches('.category-btn')) return;

        catContainer.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const sel = e.target.textContent;
        if (sel === 'All') {
            currentItems = products.slice();
        } else {
            currentItems = products.filter(p => (p.category || p.badge || 'Other') === sel);
        }

        // apply current sort
        const sortMode = modal.querySelector('.sort-select').value;
        currentItems = sortProducts(currentItems, sortMode);
        currentPage = 1;

        // Use initializeGrid to ensure buy buttons work
        initializeGrid(currentItems);
    });

    // Sorting handler
    modal.querySelector('.sort-select').addEventListener('change', (e) => {
        const mode = e.target.value;
        currentItems = sortProducts(currentItems, mode);
        currentPage = 1;
        renderProductsGrid(currentItems, currentPage);
    });

    // Initially render all products (or prefer Laptops for CSE)
    // Initialize grid with proper buy button event handling
    const initializeGrid = (items) => {
        currentItems = sortProducts(items, 'newest');
        renderProductsGrid(currentItems, currentPage);

        // Ensure buy buttons work
        const grid = modal.querySelector('.branch-products-grid');
        grid.querySelectorAll('.buy-now-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = e.target.closest('.branch-product-card');
                if (!card) return;

                const productName = card.querySelector('.product-name')?.textContent;
                if (!productName) return;

                const product = products.find(p => p.name === productName);
                if (product) {
                    showBuyOptions(product);
                } else {
                    showNotification('❌ Product information not found');
                }
            };
        });
    };

    if (branch === 'CSE') {
        const laptopItems = products.filter(p =>
            (p.category || '').toLowerCase() === 'laptops' ||
            (p.badge || '').toLowerCase() === 'laptop'
        );
        if (laptopItems.length > 0) {
            initializeGrid(laptopItems.slice(0, 30));
            // mark laptop button active if present
            const btns = Array.from(catContainer.querySelectorAll('.category-btn'));
            const laptopBtn = btns.find(b =>
                b.textContent.toLowerCase() === 'laptops' ||
                b.textContent.toLowerCase() === 'laptop'
            );
            if (laptopBtn) {
                btns.forEach(b => b.classList.remove('active'));
                laptopBtn.classList.add('active');
            }
        } else {
            initializeGrid(products);
        }
    } else {
        initializeGrid(products);
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const closeModal = () => {
        modal.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            overlay.remove();
        }, 300);
    };

    overlay.onclick = closeModal;
    modal.querySelector('.close-modal').onclick = closeModal;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    setTimeout(() => {
        overlay.classList.add('show');
        modal.classList.add('show');
    }, 10);

    // Ensure buy handlers present (renderProductsGrid attaches them already) but keep a safety attach for dynamically added
    modal.addEventListener('click', (e) => {
        if (e.target.matches('.buy-now-btn')) {
            const card = e.target.closest('.branch-product-card');
            const productName = card.querySelector('.product-name').textContent;
            const product = PRODUCT_LOOKUP[productName.toLowerCase()];
            if (product) showBuyOptions(product);
            else showNotification(`🛒 ${productName} selected.`);
        }
    });
}

// ===== MODAL MANAGEMENT =====
const modalState = {
    activeModals: new Set(),
    transitionDuration: 300,
    isAnimating: false
};

function cleanupModals() {
    if (modalState.isAnimating) return;
    modalState.isAnimating = true;

    const promises = [];

    // Remove any existing modals
    document.querySelectorAll('.modal-container').forEach(modal => {
        const promise = new Promise(resolve => {
            modal.classList.remove('visible');
            modal.classList.add('closing');

            const cleanup = () => {
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                    modalState.activeModals.delete(modal);
                }
                resolve();
            };

            setTimeout(cleanup, modalState.transitionDuration);
        });
        promises.push(promise);
    });

    // Clean up event listeners
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
        el.replaceWith(el.cloneNode(true));
    });

    // Wait for all animations to complete
    Promise.all(promises).then(() => {
        modalState.isAnimating = false;
    });
}

// ===== FILTER FUNCTIONALITY =====
const applyFilterBtn = document.getElementById('applyFilter');
const resetFilterBtn = document.getElementById('resetFilter');

applyFilterBtn.addEventListener('click', () => {
    const category = document.getElementById('categoryFilter').value;
    const brand = document.getElementById('brandFilter').value;
    const price = document.getElementById('priceFilter').value;

    // Show notification
    showNotification('✓ Filters applied successfully!');
});

resetFilterBtn.addEventListener('click', () => {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('priceFilter').value = '';
    showNotification('🔄 Filters reset!');
});

// ===== NOTIFICATION FUNCTION =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ===== NAVBAR SCROLL EFFECT =====
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.85)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ===== SMOOTH SCROLL FOR NAVIGATION =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== SEARCH FUNCTIONALITY =====
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Add loading state to search button
function setSearchLoading(isLoading) {
    if (isLoading) {
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchBtn.disabled = true;
        searchInput.disabled = true;
    } else {
        searchBtn.innerHTML = '<i class="fa fa-search"></i>';
        searchBtn.disabled = false;
        searchInput.disabled = false;
    }
}

// Enhanced search suggestions
searchInput.addEventListener('input', debounce(async (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length < 2) return;

    // Quick search for top matches
    const quickMatches = findProducts(query).slice(0, 3);
    if (quickMatches.length > 0) {
        // Show quick suggestions
        showSearchSuggestions(quickMatches);
    }
}, 300));

function showSearchSuggestions(products) {
    let suggestions = document.getElementById('search-suggestions');
    if (!suggestions) {
        suggestions = document.createElement('div');
        suggestions.id = 'search-suggestions';
        suggestions.className = 'search-suggestions';
        searchInput.parentNode.appendChild(suggestions);
    }

    suggestions.innerHTML = products.map(p => `
        <div class="search-suggestion" data-product="${p.name}">
            <span class="suggestion-icon">${p.image || '📦'}</span>
            <div class="suggestion-content">
                <div class="suggestion-name">${p.name}</div>
                <div class="suggestion-price">₹${p.price.toLocaleString('en-IN')}</div>
            </div>
        </div>
    `).join('');

    // Add click handlers
    suggestions.querySelectorAll('.search-suggestion').forEach(el => {
        el.addEventListener('click', () => {
            searchInput.value = el.dataset.product;
            suggestions.innerHTML = '';
            performSearch(el.dataset.product);
        });
    });
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-suggestions') && !e.target.closest('#searchInput')) {
        const suggestions = document.getElementById('search-suggestions');
        if (suggestions) suggestions.innerHTML = '';
    }
});

// Main search function
async function performSearch(query) {
    setSearchLoading(true);

    try {
        const raw = query || searchInput.value.trim();
        if (!raw) {
            showNotification('Please enter a product name or branch to search.');
            return;
        }

        const term = raw.toLowerCase();

        // Clear any existing suggestions
        const suggestions = document.getElementById('search-suggestions');
        if (suggestions) suggestions.innerHTML = '';

        // Simulate network delay for smoother UX
        await new Promise(resolve => setTimeout(resolve, 500));

        // If the user typed a branch short-name, open the branch
        const branchKeys = Object.keys(PRODUCTS_BY_BRANCH);
        if (branchKeys.includes(term.toUpperCase())) {
            showProducts(term.toUpperCase());
            return;
        }

        // Find matching products (uses aliases, substring and fuzzy matching)
        const matches = findProducts(term);

        if (matches.length === 0) {
            showNotification(`No products found for "${raw}"`);
            return;
        }

        if (matches.length === 1) {
            await buyProduct(matches[0].name);
            return;
        }

        // Multiple matches: show a lightweight results modal with Buy buttons
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        const modal = document.createElement('div');
        modal.className = 'custom-modal search-results-modal';

        modal.innerHTML = `
        <div class="modal-header">
            <h3>Search results for "${raw}"</h3>
            <div class="result-count">${matches.length} items found</div>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-content">
            <div class="search-results-list"></div>
        </div>
    `;

        overlay.onclick = () => { modal.remove(); overlay.remove(); };
        modal.querySelector('.close-modal')?.addEventListener('click', () => { modal.remove(); overlay.remove(); });

        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        setTimeout(() => { overlay.classList.add('show'); modal.classList.add('show'); }, 10);

        const list = modal.querySelector('.search-results-list');
        matches.forEach(p => {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            // Get branch name for this product
            const branch = Object.entries(PRODUCTS_BY_BRANCH).find(([_, products]) =>
                products.some(prod => prod.name === p.name)
            )?.[0] || '';

            item.innerHTML = `
            <div class="search-left">${p.imageUrl ? `<img src="${p.imageUrl}" class="result-thumb" alt="${p.name}"/>` : p.image}</div>
            <div class="search-mid">
                <strong>${p.name}</strong>
                <div class="result-meta">
                    ${branch ? `<span class="branch-tag">${branch}</span>` : ''}
                    ${p.category ? `<span class="category-tag">${p.category}</span>` : ''}
                    ${p.badge ? `<span class="badge-tag">${p.badge}</span>` : ''}
                </div>
                <div class="muted">${p.description}</div>
            </div>
            <div class="search-right">
                <div class="price">₹${p.price.toLocaleString('en-IN')}</div>
                <button class="buy-btn">Buy</button>
            </div>
        `;
            list.appendChild(item);
            item.querySelector('.buy-btn').addEventListener('click', (ev) => {
                const btn = ev.currentTarget;
                buyProduct(p.name, btn);
                modal.remove(); overlay.remove();
            });
        });
    } catch (error) {
        console.error('Search error:', error);
        showNotification('An error occurred while searching. Please try again.');
    } finally {
        setSearchLoading(false);
    }
}

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Quick reply helper used by chat quick buttons
function sendQuickReply(text) {
    addUserMessage(text);
    const response = getBotResponse(text.toLowerCase());
    addBotMessage(response);
}

// ===== PRODUCT BUYING FUNCTIONALITY =====
/**
 * Open product-specific marketplace links (Amazon & Flipkart) in new tabs.
 * productId: string identifier (product name is used as id in this project)
 * button: optional button element (used to show a temporary loading state)
 */
async function buyProduct(productId, button) {
    if (!productId) {
        alert('Product links not available');
        return false;
    }

    // find product (lookup supports aliases)
    const product = PRODUCT_LOOKUP[productId.toLowerCase()] || Object.values(PRODUCT_LOOKUP).find(p => p.name === productId);
    if (!product) {
        alert('Product links not available');
        return false;
    }

    // Prefer explicit product-level links (amazonLink & flipkartLink). Fallback to
    // affiliates object if present. We DO NOT use generic search fallbacks here
    // because user requested product-specific pages; if not present show alert.
    const amazon = product.amazonLink || product.affiliates?.amazon || null;
    const flipkart = product.flipkartLink || product.affiliates?.flipkart || null;

    if (!amazon && !flipkart) {
        // Respect the user's request to show an alert when links are missing
        alert('Product links not available');
        return false;
    }

    // Button feedback (non-blocking)
    if (button) {
        try {
            button.disabled = true;
            button.dataset.origText = button.textContent;
            button.textContent = 'Opening...';
            button.classList.add('loading');
        } catch (e) {
            // ignore button errors
        }
    }

    try {
        // Open amazon then flipkart (if available). Slight delays reduce some popup-blocker triggers.
        if (amazon) {
            const w = window.open(amazon, '_blank');
            try { if (w) w.opener = null; } catch (e) { /* noop */ }
        }

        if (flipkart) {
            // small delay to avoid race with popup blocking in some browsers
            setTimeout(() => {
                const w2 = window.open(flipkart, '_blank');
                try { if (w2) w2.opener = null; } catch (e) { /* noop */ }
            }, 120);
        }

        // Optional chat feedback
        if (typeof addBotMessage === 'function') {
            addBotMessage(`🛒 Opening purchase pages for ${product.name}...`);
        }

        return true;
    } catch (err) {
        console.error('buyProduct error', err);
        alert('Product links not available');
        return false;
    } finally {
        if (button) {
            setTimeout(() => {
                try {
                    button.disabled = false;
                    button.textContent = button.dataset.origText || 'Buy Now';
                    button.classList.remove('loading');
                } catch (e) { /* noop */ }
            }, 800);
        }
    }
}

// ===== PRODUCT CARD INTERACTIONS =====
document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productCard = e.target.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        await buyProduct(productName, e.target);
    });
}); document.querySelectorAll('.btn-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-heart')) {
            icon.classList.remove('fa-heart');
            icon.classList.add('fa-heart-broken');
            btn.style.color = '#ef4444';
            showNotification('💔 Removed from wishlist');
        } else {
            icon.classList.remove('fa-heart-broken');
            icon.classList.add('fa-heart');
            btn.style.color = '';
            const productName = e.target.closest('.product-card').querySelector('.product-name').textContent;
            showNotification(`❤️ ${productName} added to wishlist!`);
        }
    });
});

// ===== EXPLORE BUTTON FUNCTIONALITY =====
document.querySelector('.btn-explore').addEventListener('click', () => {
    document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
});

// ===== TYPING ANIMATION FOR HERO =====
const heroTitle = document.querySelector('.hero h1');
const originalText = heroTitle.textContent;
let charIndex = 0;

function typeWriter() {
    if (charIndex < originalText.length) {
        heroTitle.textContent = originalText.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeWriter, 50);
    }
}

// Uncomment to enable typing animation on load
// window.addEventListener('load', () => {
//   heroTitle.textContent = '';
//   setTimeout(typeWriter, 1000);
// });

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
// Note: observerOptions is now defined in the performance optimizations section
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.branch-card, .stat-card, .product-card');
    animatedElements.forEach(el => fadeObserver.observe(el));
});

// ===== PAGE LOADER =====
window.addEventListener('load', () => {
    const loader = document.querySelector('.page-loader');
    loader.classList.add('fade-out');
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
});

// ===== MOBILE MENU =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
        navLinks.classList.remove('show');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    }
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll event for navbar
window.addEventListener('scroll', debounce(() => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.85)';
        navbar.style.boxShadow = 'none';
    }
}, 10));

// Optimize animation performance
const animatedElements = document.querySelectorAll('.branch-card, .stat-card, .product-card');
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target); // Stop observing after animation
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
} else {
    // Fallback for older browsers
    animatedElements.forEach(el => el.classList.add('animate'));
}

// ===== CONSOLE WELCOME MESSAGE =====
console.log('%c👋 Welcome to StudentGear!', 'color: #6366f1; font-size: 24px; font-weight: bold;');
console.log('%c🎓 Built for students by students', 'color: #10b981; font-size: 16px;');
console.log('%c💻 Need help? Contact us at support@studentgear.com', 'color: #94a3b8; font-size: 14px;');

// ===== CUSTOM PRODUCT ADDER (admin-friendly) =====
// Allows adding products at runtime (persisted to localStorage). Supports image file upload (stored as data URL)
// Usage: Click the floating + button added to the page, fill the form and submit. Products are saved under 'customProducts'.

// Load custom products from localStorage and merge into PRODUCTS_BY_BRANCH and PRODUCT_LOOKUP
function loadCustomProducts() {
    try {
        const raw = localStorage.getItem('customProducts');
        if (!raw) return;
        const custom = JSON.parse(raw);
        if (!Array.isArray(custom)) return;
        custom.forEach(p => {
            const branch = (p.branch || 'CSE').toUpperCase();
            if (!PRODUCTS_BY_BRANCH[branch]) PRODUCTS_BY_BRANCH[branch] = [];
            // Avoid duplicates by name
            const exists = PRODUCTS_BY_BRANCH[branch].some(x => x.name === p.name);
            if (!exists) PRODUCTS_BY_BRANCH[branch].push(p);

            // Add to lookup map for chatbot/search
            try {
                PRODUCT_LOOKUP[p.name.toLowerCase()] = p;
                if (Array.isArray(p.aliases)) p.aliases.forEach(a => PRODUCT_LOOKUP[a.toLowerCase()] = p);
            } catch (e) {
                // PRODUCT_LOOKUP may be a const built earlier; mutate if possible
            }
        });
    } catch (e) {
        console.error('Failed to load custom products', e);
    }
}

// Save one product into localStorage customProducts
function saveCustomProduct(product) {
    try {
        const raw = localStorage.getItem('customProducts');
        const arr = raw ? JSON.parse(raw) : [];
        arr.push(product);
        localStorage.setItem('customProducts', JSON.stringify(arr));
    } catch (e) {
        console.error('Failed to save custom product', e);
    }
}

// Create a small floating FAB to trigger the add-product modal
(function createAddProductFab() {
    const fab = document.createElement('button');
    fab.className = 'fab-add-product';
    fab.title = 'Add product';
    fab.style.position = 'fixed';
    fab.style.right = '18px';
    fab.style.bottom = '18px';
    fab.style.width = '46px';
    fab.style.height = '46px';
    fab.style.borderRadius = '50%';
    fab.style.border = 'none';
    fab.style.background = '#10b981';
    fab.style.color = '#fff';
    fab.style.fontSize = '26px';
    fab.style.cursor = 'pointer';
    fab.style.boxShadow = '0 6px 18px rgba(16,185,129,0.18)';
    fab.style.zIndex = '9999';
    fab.textContent = '+';
    fab.setAttribute('aria-label', 'Add product');
    fab.addEventListener('click', openAddProductModal);
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(fab));
})();

// Open modal to add product (supports image file input or image URL)
function openAddProductModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-container add-product-modal';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content" style="max-width:560px;padding:18px;">
            <div class="modal-header">
                <h3>Add product</h3>
                <button class="modal-close" aria-label="Close" type="button">×</button>
            </div>
            <div class="modal-body">
                <form id="addProductForm">
                    <div style="display:flex;gap:8px;margin-bottom:8px;"><input name="name" placeholder="Product name" required style="flex:1;padding:8px;" /><input name="price" placeholder="Price (number)" required style="width:120px;padding:8px;"/></div>
                    <div style="display:flex;gap:8px;margin-bottom:8px;"><select name="branch" style="padding:8px;width:180px;">${Object.keys(PRODUCTS_BY_BRANCH).map(b => `<option value="${b}">${b}</option>`).join('')}</select><input name="category" placeholder="Category" style="flex:1;padding:8px;"/></div>
                    <div style="margin-bottom:8px;"><input name="amazonLink" placeholder="Amazon link (optional)" style="width:100%;padding:8px;"/></div>
                    <div style="margin-bottom:8px;"><input name="flipkartLink" placeholder="Flipkart link (optional)" style="width:100%;padding:8px;"/></div>
                    <div style="margin-bottom:8px;display:flex;gap:8px;"><input name="imageUrl" placeholder="Image URL (optional)" style="flex:1;padding:8px;"/><input type="file" name="imageFile" accept="image/*" style="width:140px;padding:4px;"/></div>
                    <div style="margin-bottom:8px;"><textarea name="description" rows="3" placeholder="Description" style="width:100%;padding:8px;"></textarea></div>
                    <div style="text-align:right;"><button type="submit" class="btn-primary" style="padding:8px 12px;">Add product</button></div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const close = () => { modal.remove(); };
    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.querySelector('.modal-backdrop').addEventListener('click', close);

    const form = modal.querySelector('#addProductForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = fd.get('name').trim();
        const price = parseFloat(fd.get('price')) || 0;
        const branch = (fd.get('branch') || 'CSE').toUpperCase();
        const category = fd.get('category') || '';
        const amazonLink = fd.get('amazonLink') || undefined;
        const flipkartLink = fd.get('flipkartLink') || undefined;
        const imageUrlInput = (fd.get('imageUrl') || '').trim();
        const imageFile = form.elements['imageFile'].files[0];
        const description = fd.get('description') || '';

        // Build product object
        const product = {
            name,
            price,
            category,
            description,
            badge: category || '',
            aliases: [],
            dateAdded: new Date().toISOString(),
            affiliates: {}
        };
        if (amazonLink) product.affiliates.amazon = amazonLink;
        if (flipkartLink) product.affiliates.flipkart = flipkartLink;

        // If an image file is provided, read as data URL; otherwise use imageUrlInput
        if (imageFile) {
            const dataUrl = await new Promise((res, rej) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result);
                reader.onerror = rej;
                reader.readAsDataURL(imageFile);
            });
            product.imageUrl = dataUrl; // inline data URL (persisted to localStorage)
        } else if (imageUrlInput) {
            product.imageUrl = imageUrlInput;
        } else {
            product.imageUrl = 'assets/placeholder.svg';
        }

        // Persist and merge
        saveCustomProduct(Object.assign({ branch }, product));

        // Merge into runtime structures so UI updates immediately
        if (!PRODUCTS_BY_BRANCH[branch]) PRODUCTS_BY_BRANCH[branch] = [];
        PRODUCTS_BY_BRANCH[branch].push(product);
        try { PRODUCT_LOOKUP[product.name.toLowerCase()] = product; } catch (e) { /* noop */ }

        showNotification(`✅ Product "${product.name}" added`);
        close();
    });
}

// Load any existing custom products on startup
document.addEventListener('DOMContentLoaded', loadCustomProducts);

// ===== SIMPLE CLIENT-SIDE AUTH (no external SaaS) =====
// Provides a friendly login modal and stores a demo user token in localStorage.
const AUTH_KEY = 'studentgear_auth';

function getStoredUser() {
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setStoredUser(user) {
    try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch (e) {
        console.error('Failed to store auth', e);
    }
}

function clearStoredUser() {
    localStorage.removeItem(AUTH_KEY);
}

function updateLoginUI() {
    const loginBtn = document.querySelector('.login-btn');
    const user = getStoredUser();
    if (!loginBtn) return;
    if (user && user.name) {
        loginBtn.textContent = `Hi, ${user.name}`;
        loginBtn.onclick = showUserMenu;
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = showLoginModal;
    }
}

function showLoginModal() {
    // If modal already exists, focus first input
    if (document.querySelector('.login-modal')) {
        document.querySelector('.login-modal input[name="email"]').focus();
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-container login-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content" style="max-width:420px;padding:18px;">
            <div class="modal-header">
                <h3>Login to StudentGear</h3>
                <button class="modal-close" aria-label="Close">×</button>
            </div>
            <div class="modal-body">
                <form id="loginForm">
                    <div style="margin-bottom:8px;"><label>Email</label><input name="email" type="email" required style="width:100%;padding:8px;"/></div>
                    <div style="margin-bottom:8px;position:relative;"><label>Password</label><input name="password" type="password" required style="width:100%;padding:8px;"/><button type="button" id="togglePwd" style="position:absolute;right:8px;top:32px;padding:4px">Show</button></div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><input type="checkbox" id="rememberMe"/><label for="rememberMe">Remember me</label></div>
                    <div style="display:flex;justify-content:space-between;align-items:center;"><button type="submit" class="btn-primary" style="padding:8px 12px">Login</button><a href="#" id="forgotPwd">Forgot?</a></div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    // Add visible class after a tiny delay to trigger CSS transition
    setTimeout(() => modal.classList.add('visible'), 10);
    const close = () => modal.remove();
    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.querySelector('.modal-backdrop').addEventListener('click', close);

    const form = modal.querySelector('#loginForm');
    const toggleBtn = modal.querySelector('#togglePwd');
    toggleBtn.addEventListener('click', () => {
        const pwd = form.elements['password'];
        if (pwd.type === 'password') { pwd.type = 'text'; toggleBtn.textContent = 'Hide'; } else { pwd.type = 'password'; toggleBtn.textContent = 'Show'; }
    });

    modal.querySelector('#forgotPwd').addEventListener('click', (e) => { e.preventDefault(); showNotification('Check your email for password reset instructions (simulated).'); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.elements['email'].value.trim();
        const password = form.elements['password'].value;
        if (!email || !password) { showNotification('Please enter email and password'); return; }
        // simple email validation
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) { showNotification('Please enter a valid email'); return; }

        const submitBtn = form.querySelector('button[type="submit"]');
        const orig = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        // API base URL - use same origin if served from backend
        const API_BASE = window.API_BASE || (window.location.origin.includes('localhost') ? window.location.origin : 'http://localhost:3000');

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                showNotification(err.error || 'Login failed');
                submitBtn.disabled = false; submitBtn.textContent = orig;
                return;
            }

            const data = await res.json();
            const user = {
                name: (data.user && data.user.name) ? data.user.name : email.split('@')[0],
                email: email,
                token: data.token || ('demo-token-' + Math.random().toString(36).slice(2, 9))
            };
            setStoredUser(user);
            updateLoginUI();
            showNotification('✅ Logged in successfully');
            modal.remove();
        } catch (err) {
            console.error('Login error', err);
            // Fallback to demo mode if backend is unavailable
            const user = { name: email.split('@')[0], email, token: 'demo-token-' + Math.random().toString(36).slice(2, 9) };
            setStoredUser(user);
            updateLoginUI();
            showNotification('✅ Logged in (demo mode)');
            modal.remove();
        }
    });
}

function showUserMenu() {
    // remove existing menu
    const existing = document.querySelector('.user-menu'); if (existing) existing.remove();
    const user = getStoredUser(); if (!user) { updateLoginUI(); return; }
    const menu = document.createElement('div'); menu.className = 'user-menu';
    menu.style.position = 'absolute'; menu.style.right = '18px'; menu.style.top = '64px'; menu.style.background = '#fff'; menu.style.border = '1px solid #e5e7eb'; menu.style.padding = '8px'; menu.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
    menu.innerHTML = `<ul style="list-style:none;margin:0;padding:0;"><li style="padding:8px 12px;">Signed in as <strong>${user.name}</strong></li><li style="padding:8px 12px;cursor:pointer;">Profile</li><li style="padding:8px 12px;cursor:pointer;">Orders</li><li style="padding:8px 12px;cursor:pointer;" id="logoutBtn">Logout</li></ul>`;
    document.body.appendChild(menu);
    document.addEventListener('click', function onDocClick(e) { if (!menu.contains(e.target) && !document.querySelector('.login-btn').contains(e.target)) { menu.remove(); document.removeEventListener('click', onDocClick); } });
    menu.querySelector('#logoutBtn').addEventListener('click', () => { clearStoredUser(); updateLoginUI(); menu.remove(); showNotification('👋 Logged out'); });
}

// Initialize login button state on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLoginUI);
} else {
    // DOM already loaded, call immediately
    updateLoginUI();
}