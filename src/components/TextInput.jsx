const TextInput = ({ label, ...props }) => {
  return (
    <div className="input">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
};

export default TextInput;
