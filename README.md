<img width="1913" height="1105" alt="image" src="https://github.com/user-attachments/assets/e0453ddd-d00b-4969-b76c-6c27d3ee4814" /># Wool Monitoring Application 🐑

A modern, enterprise-grade full-stack application for managing the wool supply chain, from farm to fabric. This platform serves Farmers, Mill Operators, Quality Inspectors, and Buyers with tailored dashboards and tools.

## 🚀 Features

*   **Role-Based Access Control (RBAC)**: Secure dashboards for Farmers, Inspectors, Mill Operators, Buyers, and Admins.
*   **Detailed Batch Tracking**: Track wool batches through processing stages (Cleaning, Carding, Spinning, etc.) with a visual timeline.
*   **Scientific Quality Inspections**: Lab interface for recording micron, yield, and tensile strength data.
*   **Marketplace & Orders**: Functioning e-commerce system for approved wool batches with invoice generation.
*   **IoT Monitoring**: Real-time environmental monitoring dashboard for warehouse conditions.
*   **premium UI/UX**: Dark glassmorphism theme, smooth animations (Framer Motion), and responsive layouts.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS (Custom Dark/Glass Theme)
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **State Management**: React Context API
*   **HTTP Client**: Axios

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Authentication**: JWT (JSON Web Tokens)
*   **File Uploads**: Multer

## 📂 Project Structure

```bash
wool-monitoring-app/
├── client/           # React Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── layouts/     # Dashboard & Auth layouts
│   │   ├── pages/       # Application routes/pages
│   │   └── ...
├── server/           # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/ # Logic for routes
│   │   ├── models/      # Mongoose Schemas
│   │   ├── routes/      # API Endpoints
│   │   └── ...
```

## ⚡ Getting Started

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Local or Atlas URI)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/wool-monitoring-application.git
    cd wool-monitoring-application
    ```

2.  **Install Dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

### Running the App

1.  **Start the Backend**
    ```bash
    cd server
    npm run dev
    ```

2.  **Start the Frontend**
    ```bash
    cd client
    npm run dev
    ```

The app will be available at `http://localhost:5173`.

## 📸 Screenshots


| Farmer Dashboard | Marketplace |
|:---:|:---:|
| ![Farmer Dashboard](<img width="1913" height="1105" alt="image" src="https://github.com/user-attachments/assets/82c2826f-ff1f-41ea-9794-594a5148f740" />| ![Marketplace]<img width="1918" height="1109" alt="image" src="https://github.com/user-attachments/assets/1c0fa7c8-8e1c-4ca5-bd4c-9fd9825071bb" /> 

| Inspection Hub | Mobile View |
|:---:|:---:|
| ![Lab Hub](<img width="1919" height="1107" alt="image" src="https://github.com/user-attachments/assets/d9b6994d-c6fb-4f88-81db-d48ed80abaa0" /> | ![Mobile](<img width="1918" height="1106" alt="image" src="https://github.com/user-attachments/assets/12812eee-ecb1-4376-ae38-4a2465a11746" /> |

## 🛡️ License

This project is licensed under the MIT License.

## 👨‍💻 Contributors

*   **Hansh Raj** - *Developer & Co-Creator*

