function UserMessage({content}) {
  return (
    <div className="text-right">
      <div className="inline-block bg-blue-200 py-2 px-3 rounded-xl">
        {content}
      </div>
    </div>
  );
}

export default UserMessage;