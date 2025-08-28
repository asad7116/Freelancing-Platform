import React, { useRef, useState } from "react";
import CategoryCard from "./CategoryCard";
import "../styles/Category.css";
import categories from "../data/categoriesData";

export default function Category(){
    const rowRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);

    const scroll = (direction= "right") => {
        const el =rowRef.current;
        if(!el) return;
        const card = el.querySelector(".category-card");
        const gap = parseInt(getComputedStyle(el).columnGap || 20, 10)|| 20;
        const step = (card?.offsetWidth || 200) + gap;
        el.scrollBy({left: direction === "left" ? -step : step, behavior: "smooth"});

    };

    return(
        <section className="categories-section">
            <div className="categories-inner">
                <div className="categories-heading">
                    <div>
                        <h2>Our Popular Catories</h2>
                        <p className="muted">Get some inspirations from 86K+ skills</p>
                    </div>
                    <div className="cats-arrows" aria-hidden>
                        <button className="arrow-btn" onClick={()=>scroll("left")} aria-label="Scroll left">{/*svg left*/}&lt;</button>
                        <button className="arrow-btn" onClick={()=>scroll("right")} aria-label="Scroll right">{/*svg right*/}&gt;</button>
                    </div>
                </div>

                <div className="categories-row" ref={rowRef} role="list">
                    {categories.map((cat) =>(
                        <CategoryCard
                            key={cat.id}
                            title={cat.title}
                            subtitle={cat.subtitle}
                            img={cat.img}
                            isSelected={cat.id === selectedId}
                            onClick={() => setSelectedId(cat.id)}
                            />
                    ))}
                </div>
            </div>
            
        </section>

                
    );
}