import React, { useState } from "react";
import Button from "react-bootstrap/Button";

export default function EditBtn({
  handleAdd,
  handleRemove,
  handleFinish,
  numOptions,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const clickFinish = () => {
    toggleEditing();
    handleFinish();
  };

  return (
    <div>
      {!isEditing && (
        <Button
          className="edit-option__btn"
          variant="outline-dark"
          onClick={toggleEditing}
        >
          Edit Option
        </Button>
      )}
      {isEditing && (
        <div>
          <Button
            className="edit-option__btn"
            variant="outline-dark"
            onClick={handleAdd}
          >
            Add
          </Button>
          <Button
            className="edit-option__btn"
            variant="outline-dark"
            onClick={handleRemove}
            disabled={numOptions === 0}
          >
            Remove
          </Button>
          <Button
            className="edit-option__btn"
            variant="outline-dark"
            onClick={clickFinish}
          >
            Finish
          </Button>
        </div>
      )}
    </div>
  );
}
