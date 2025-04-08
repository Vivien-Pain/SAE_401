export default function Icons_Modal({className}: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#6E50A3" />
      <path
        fill="#FFFFFF"
        d="M11 8H13V11H16V13H13V16H11V13H8V11H11V8Z"
      />
    </svg>
  );
}