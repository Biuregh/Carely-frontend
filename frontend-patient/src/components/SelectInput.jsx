
const TextInput = (props) => {
  console.log('TextInput props:', props);
  return (
    <div className="input">
      <label>{props.label}</label>
      <input {...props} />
    </div>
  );
};

export default TextInput;