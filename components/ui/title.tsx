interface HeaderProps {
  title: string
  description: string
}

export default function Title({ title, description }: HeaderProps) {
  return (
    <>
      <h1 className="text-xl font-medium">{title}</h1>
      <p className="text-sm mt-2 text-gray-400">{description}</p>
    </>
  )
}
