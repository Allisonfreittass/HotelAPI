
import React from 'react';

interface FormFooterProps {
  message: string;
  linkText: string;
  onLinkClick: () => void;
}

const FormFooter: React.FC<FormFooterProps> = ({ message, linkText, onLinkClick }) => {
  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">
        {message}{" "}
        <button
          onClick={onLinkClick}
          className="text-hotel-800 dark:text-hotel-200 hover:underline font-medium"
          type="button"
        >
          {linkText}
        </button>
      </p>
    </div>
  );
};

export default FormFooter;
