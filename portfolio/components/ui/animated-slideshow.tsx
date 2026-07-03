"use client"

import * as React from "react"
import { HTMLMotionProps, MotionConfig, motion } from "motion/react"
import { cn } from "@/lib/utils"

interface TextStaggerHoverProps {
  text: string
  index: number
}

interface HoverSliderImageProps {
  index: number
  imageUrl: string
}

interface HoverSliderProps {}

interface HoverSliderContextValue {
  activeSlide: number
  changeSlide: (index: number) => void
}

function splitText(text: string) {
  const words = text.split(" ").map((word) => word.concat(" "))
  const characters = words.map((word) => word.split("")).flat(1)

  return {
    words,
    characters,
  }
}

const HoverSliderContext = React.createContext<
  HoverSliderContextValue | undefined
>(undefined)

function useHoverSliderContext() {
  const context = React.useContext(HoverSliderContext)

  if (context === undefined) {
    throw new Error(
      "useHoverSliderContext must be used within a HoverSliderProvider"
    )
  }

  return context
}

export const HoverSlider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & HoverSliderProps
>(({ children, className, ...props }, ref) => {
  const [activeSlide, setActiveSlide] = React.useState<number>(0)

  const changeSlide = React.useCallback((index: number) => {
    setActiveSlide(index)
  }, [])

  return (
    <HoverSliderContext.Provider value={{ activeSlide, changeSlide }}>
      <div ref={ref} className={cn(className)} {...props}>
        {children}
      </div>
    </HoverSliderContext.Provider>
  )
})

HoverSlider.displayName = "HoverSlider"

export const TextStaggerHover = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & TextStaggerHoverProps
>(({ text, index, className, ...props }, ref) => {
  const { activeSlide, changeSlide } = useHoverSliderContext()
  const { characters } = splitText(text)
  const isActive = activeSlide === index

  return (
    <span
      ref={ref}
      className={cn(
        "relative inline-block origin-bottom overflow-hidden focus:outline-none",
        className
      )}
      onMouseEnter={() => changeSlide(index)}
      onFocus={() => changeSlide(index)}
      tabIndex={0}
      {...props}
    >
      {characters.map((char, characterIndex) => (
        <span
          key={`${char}-${characterIndex}`}
          className="relative inline-block overflow-hidden pt-2 -mt-2"
        >
          <MotionConfig
            transition={{
              delay: characterIndex * 0.02,
              duration: 0.32,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <motion.span
              className="inline-block opacity-25"
              initial={{ y: "0%" }}
              animate={isActive ? { y: "-125%" } : { y: "0%" }}
            >
              {char}
              {char === " " && characterIndex < characters.length - 1 && (
                <>&nbsp;</>
              )}
            </motion.span>

            <motion.span
              className="absolute left-0 top-2 inline-block opacity-100"
              initial={{ y: "125%" }}
              animate={isActive ? { y: "0%" } : { y: "125%" }}
            >
              {char}
            </motion.span>
          </MotionConfig>
        </span>
      ))}
    </span>
  )
})

TextStaggerHover.displayName = "TextStaggerHover"

export const clipPathVariants = {
  visible: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  },
  hidden: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  },
}

export const HoverSliderImageWrap = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid overflow-hidden rounded-2xl border border-black/10 bg-black/5 shadow-sm dark:border-white/10 dark:bg-white/5 *:col-start-1 *:col-end-1 *:row-start-1 *:row-end-1 *:size-full",
        className
      )}
      {...props}
    />
  )
})

HoverSliderImageWrap.displayName = "HoverSliderImageWrap"

export const HoverSliderImage = React.forwardRef<
  HTMLImageElement,
  HTMLMotionProps<"img"> & HoverSliderImageProps
>(({ index, imageUrl, className, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext()

  return (
    <motion.img
      ref={ref}
      src={imageUrl}
      className={cn("inline-block align-middle", className)}
      transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.8 }}
      variants={clipPathVariants}
      animate={activeSlide === index ? "visible" : "hidden"}
      {...props}
    />
  )
})

HoverSliderImage.displayName = "HoverSliderImage"

export const HoverSliderDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { descriptions: string[] }
>(({ descriptions, className, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext()
  return (
    <p
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {descriptions[activeSlide]}
    </p>
  )
})

HoverSliderDescription.displayName = "HoverSliderDescription"

export const HoverSliderTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { titles: string[] }
>(({ titles, className, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext()
  return (
    <h3
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {titles[activeSlide]}
    </h3>
  )
})

HoverSliderTitle.displayName = "HoverSliderTitle"

export const HoverSliderFeatures = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & { features: string[][] }
>(({ features, className, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext()
  const activeFeatures = features[activeSlide] || []
  return (
    <ul
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {activeFeatures.map((feat, idx) => (
        <li key={idx} className="flex items-center gap-2.5 text-body-sm text-body">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-pink shrink-0" />
          <span>{feat}</span>
        </li>
      ))}
    </ul>
  )
})

HoverSliderFeatures.displayName = "HoverSliderFeatures"

// Export utility hook to read context from external components (e.g. dynamic description text)
export function useHoverActiveSlide() {
  return useHoverSliderContext()
}
