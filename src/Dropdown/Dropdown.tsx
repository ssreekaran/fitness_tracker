import React, { useState } from "react";
import DropdownButton from "./DropdownButton";
import DropdownContent from "./DropdownContent";
import LoginForm from "./LoginForm";

interface DropdownProps {
  buttonText: React.ReactNode;
  content: React.ReactNode;
  isOpen?: boolean;
  toggle?: () => void;
}

const Dropdown = ({
  buttonText,
  content,
  isOpen,
  toggle,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const actualOpen = typeof isOpen === 'boolean' ? isOpen : open;
  const actualToggle = toggle || (() => setOpen((open) => !open));

  // If content is LoginForm, inject close handler for Sign Up
  const contentWithProps = React.isValidElement(content) && content.type === LoginForm
    ? React.cloneElement(content, { onSignUpClick: () => {
        if (toggle) toggle();
        setOpen(false);
      } })
    : content;

  return (
    <div className="dropdown">
      <DropdownButton toggle={actualToggle} open={actualOpen}>
        {buttonText}
      </DropdownButton>
      <DropdownContent open={actualOpen}>{contentWithProps}</DropdownContent>
    </div>
  );
};

export default Dropdown;
