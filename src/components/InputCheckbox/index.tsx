import classNames from "classnames"
import { useRef } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)

  /*
  Here we define a function that will be called when the checkbox is changed.
  It will call the onChange prop with the new value.
  */
  const handleChange = () => {
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className="RampInputCheckbox--input"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
      />
      <label
        /*
        Bug 2: Approve checkbox not working
        Solution: Here we associate the label with the input using htmlFor.
        This attribute is used by screen readers to know which input the label is for.
        */
        htmlFor={inputId} 
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
      />
    </div>
  );
}
