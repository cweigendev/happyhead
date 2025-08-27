import * as React from "react"
import { cn } from "@/lib/utils";

interface ButtonCtaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    className?: string;
}

function ButtonCta({ label = "Get Access", className, ...props }: ButtonCtaProps) {
    return (
        <button
            className={cn(
                "group relative w-auto h-8 px-3 rounded-lg overflow-hidden transition-all duration-500",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-b from-[#2e2e2e] via-[#09090b] to-[#191919]">
                <div className="absolute inset-0 bg-[#09090b] rounded-lg opacity-90" />
            </div>

            <div className="absolute inset-[2px] bg-[#09090b] rounded-lg opacity-95" />

            <div className="absolute inset-[2px] bg-gradient-to-r from-[#09090b] via-[#191919] to-[#09090b] rounded-lg opacity-90" />
            <div className="absolute inset-[2px] bg-gradient-to-b from-[#2e2e2e]/40 via-[#191919] to-[#09090b]/30 rounded-lg opacity-80" />
            <div className="absolute inset-[2px] bg-gradient-to-br from-[#c01a1a]/10 via-[#191919] to-[#2e2e2e]/50 rounded-lg" />

            <div className="absolute inset-[2px] shadow-[inset_0_0_15px_rgba(192,26,26,0.15)] rounded-lg" />

            <div className="relative flex items-center justify-center gap-2">
                <span className="text-sm font-light bg-gradient-to-b from-[#ff6b6b] to-[#e30032] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(227,0,50,0.4)] tracking-tighter font-satoshi">
                    {label}
                </span>
            </div>

            <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2e2e2e]/20 via-[#c01a1a]/10 to-[#2e2e2e]/20 group-hover:opacity-100 rounded-lg" />
        </button>
    );
}

export { ButtonCta }
