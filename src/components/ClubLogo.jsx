import Logoblanco from '../assets/Logoblanco.svg';
import Logonegro from '../assets/Logonegro.svg';

const ClubLogo = ({ className = "w-full h-full", darkMode = false }) => {
    return (
        <img
            src={darkMode ? Logoblanco : Logonegro}
            alt="Club Logo"
            className={className}
        />
    );
};

export default ClubLogo;
