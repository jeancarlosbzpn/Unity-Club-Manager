import AppLogo from '../assets/Logo.png';
import LogoBlanco from '../assets/LogoBlanco.png';

const ClubLogo = ({ className = "w-full h-full", darkMode = false }) => {
    return (
        <img
            src={darkMode ? LogoBlanco : AppLogo}
            alt="Club Logo"
            className={className}
        />
    );
};

export default ClubLogo;
