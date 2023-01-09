import heatMapData from "./ElasticData";

let init = false;

function mouseInHeatMap(event: MouseEvent) {
    let child: Element = document.getElementById("heatMapSVG")?.firstChild as Element;
    let box: DOMRect = child.getBoundingClientRect();

    let inX = event.clientX > box.x && event.clientX < box.right;
    let inY = event.clientY > box.y && event.clientY < box.bottom;

    return inY && inX;
}

function initUserNav(panUnit: number, heatMap: heatMapData, 
                    setStartDate: React.Dispatch<React.SetStateAction<string>>, 
                    setEndDate: React.Dispatch<React.SetStateAction<string>>) {
    if(init) return;

    let isMouseDown: boolean = false;
    let offset = 0;
    let startMouseDownPos = {
        x: 0,
        y: 0
    }


    window.addEventListener("mouseup", () => isMouseDown = false);

    window.addEventListener("mousedown", (event: MouseEvent) =>{
        isMouseDown = true;
        startMouseDownPos = {
            x: event.pageX,
            y: event.pageY
        }
    });

    window.addEventListener("mousemove", (event: MouseEvent) => {
        if (!isMouseDown || !mouseInHeatMap(event)) return;
        
        offset = startMouseDownPos.x - event.pageX;

        if (offset > heatMap.panUnit) {
            heatMap.shiftEndDate('+');
            heatMap.shiftStartDate('+');
            offset = 0;
            startMouseDownPos.x = event.pageX
        }

        else if (offset < -heatMap.panUnit ) {
            heatMap.shiftEndDate('-');
            heatMap.shiftStartDate('-');
            offset = 0;
            startMouseDownPos.x = event.pageX
        }
        
        if (heatMap.setStartDateHook !== undefined) 
            heatMap.setStartDateHook(heatMap.startDate.toISOString());
        if (heatMap.setEndDateHook !== undefined) 
            heatMap.setEndDateHook(heatMap.endDate.toISOString());
    })

    init = true;
}

export default initUserNav;