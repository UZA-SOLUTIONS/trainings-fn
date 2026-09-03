import { FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { FlowingMenu } from "@/components/home/FlowingMenu";
import { PATH_STEP_IMAGES, PROGRAMME_STEPS } from "@/content/marketing";

const FLOWING_STEPS = PROGRAMME_STEPS.map((step, i) => ({
  link: "/#path",
  text: `${step.n}  ${step.title}`,
  image: PATH_STEP_IMAGES[i % PATH_STEP_IMAGES.length],
}));

export function PathSection() {
  return (
    <section id="path" className="section-y scroll-mt-20">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
              Six steps, one ID, nothing lost between offices.
            </h2>
          </div>
          <Button asChild variant="outline" className="shadow-none">
            <a href="#partners" className="inline-flex items-center gap-2">
              See partners
              <FiArrowRight aria-hidden />
            </a>
          </Button>
        </div>
      </div>
      <div className="relative mt-8 h-[min(85vh,44rem)] sm:mt-12">
        <FlowingMenu items={FLOWING_STEPS} speed={15} />
      </div>
    </section>
  );
}
