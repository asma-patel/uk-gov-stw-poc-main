
interface IconProp {
    type: string,
    size: number;
}

const Icon = (props: IconProp) => {
    switch (props.type) {
        case 'down-arrow':
            return <div>hello</div>
    }
}


export default Icon;

