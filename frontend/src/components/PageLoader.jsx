import { Quantum } from "ldrs/react";
import "ldrs/react/Quantum.css";

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Quantum size="70" speed="1.75" color="white" />
    </div>
  );
}

export default PageLoader;
