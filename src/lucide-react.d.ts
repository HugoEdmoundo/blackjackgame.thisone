declare module "@lottiefiles/react-lottie-player" {
  import { FC } from "react"
  interface LottiePlayerProps {
    src: string
    loop?: boolean
    autoplay?: boolean
    style?: React.CSSProperties
    className?: string
  }
  export const Player: FC<LottiePlayerProps>
}

declare module "lucide-react" {
  import { FC, SVGProps } from "react"
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string
  }
  type Icon = FC<IconProps>
  export const Sun: Icon
  export const Moon: Icon
  export const Shield: Icon
  export const CheckCircle: Icon
  export const Hand: Icon
  export const HandMetal: Icon
  export const RefreshCw: Icon
  export const Scissors: Icon
  export const Flag: Icon
  export const Wallet: Icon
  export const BarChart3: Icon
  export const Plus: Icon
  export const Minus: Icon
  export const Play: Icon
  export const Trophy: Icon
  export const XCircle: Icon
  export const Settings: Icon
  export const Briefcase: Icon
  export const ArrowLeft: Icon
  export const AlertTriangle: Icon
  export const Home: Icon
  export const ArrowRight: Icon
  export const User: Icon
  export const Key: Icon
  export const Sparkles: Icon
  export const Crown: Icon
  export const Copy: Icon
  export const Check: Icon
  export const Users: Icon
  export const LogOut: Icon
}
