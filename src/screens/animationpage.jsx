import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Animationpage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="app">
      <div className="onboarding">
        {" "}
        <div className="welcome">
          <img
            src="https://i.ibb.co/hxtLfnLd/png-transparent-w-hotels-starwood-marriott-international-logo-hotel-angle-text-logo-removebg-preview.png"
            alt="png transparent w hotels starwood marriott international logo hotel angle text logo removebg preview"
            border="0"
            className="onboarding-image"
          />
        </div>
      </div>
    </div>
  );
}

export default Animationpage;
/*hotel*/
