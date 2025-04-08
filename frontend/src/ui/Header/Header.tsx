// Header.tsx
import React from "react";
import {
  headerContainer,
  svgContainer,
  textContainer,
  welcomeText,
  usernameText,
} from "./HeaderStyles";
import Icons_Profiles from "../Icons/Icons_Logo"; // Import du composant

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  return (
    <div
      // Par défaut : borderColor = "teal"
      // On peut néanmoins surcharger la variable : 
      // className={headerContainer({ borderColor: "gray" })}
      className={headerContainer()}
    >
      <div className={svgContainer()}>
        {/* Utilisation du composant Icons_Profiles */}
        <Icons_Profiles />
      </div>

      <div className={textContainer()}>
        {/* Pour changer la couleur du texte principal, on peut faire :
            className={welcomeText({ highlightColor: "teal" })} 
        */}
        <p className={welcomeText()}>
          Bienvenue,{" "}
          {/* Pour changer la couleur du nom d'utilisateur, on peut faire :
              <span className={usernameText({ color: "teal" })}>...</span>
          */}
          <span className={usernameText()}>
            {username || "Chargement..."}
          </span>{" "}
          !
        </p>
      </div>
    </div>
  );
};

export default Header;
