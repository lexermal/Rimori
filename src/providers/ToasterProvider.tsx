"use client";

import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <div>
      <Toaster
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </div>

  );
};

export default ToasterProvider;