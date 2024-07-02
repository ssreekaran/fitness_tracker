import React, { useState } from "react";
import DropdownButton from "./DropdownButton";
import DropdownContent from "./DropdownContent";

const Dropdown = ({
  buttonText,
  content,
}: {
  buttonText: React.ReactNode;
  content: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const toggleDropdpwn = () => {
    setOpen((open) => !open);
  };
  return (
    <div className="dropdown">
      <DropdownButton toggle={toggleDropdpwn} open={open}>
        {buttonText}
      </DropdownButton>
      <DropdownContent open={open}>{content}</DropdownContent>
    </div>
  );
};

export default Dropdown;
