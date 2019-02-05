import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'sortSearch' })

export class SortSearchPipe implements PipeTransform {
    transform(value, sortingMethod: string, searchTerm: string) {
        let newArr = [];

        if (Array.isArray(value)) {
            newArr = value.filter(obj => {
                if (searchTerm === '')
                    return obj;

                else if (obj.OBJECT_NAME.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
                    return obj;
            });

            if (sortingMethod === 'None')
                return newArr;

            else if (sortingMethod === 'Name A to Z')
                return newArr.sort((obj1, obj2) => obj1.OBJECT_NAME > obj2.OBJECT_NAME ? 1 : -1);

            else if (sortingMethod === 'Name Z to A')
                return newArr.sort((obj1, obj2) => obj1.OBJECT_NAME > obj2.OBJECT_NAME ? -1 : 1);

            else if (sortingMethod === 'Latest First')
                return newArr.sort((obj1, obj2) => obj1.OBJECT_DETAILS_LOAD_DATE > obj2.OBJECT_DETAILS_LOAD_DATE ? -1 : 1);

            else if (sortingMethod === 'Oldest First')
                return newArr.sort((obj1, obj2) => obj1.OBJECT_DETAILS_LOAD_DATE > obj2.OBJECT_DETAILS_LOAD_DATE ? 1 : -1);
        }
        else {
            for (let key in value) {
                if (searchTerm === '')
                    newArr.push({ key: key, value: value[key] });

                else if (value[key].NAME.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
                    newArr.push({ key: key, value: value[key] });
            }

            if (sortingMethod === 'None')
                return newArr.sort((obj1, obj2) => obj1.value.DATE_CREATED > obj2.value.DATE_CREATED ? -1 : 1);
            
            else if (sortingMethod === 'Name A to Z')
                return newArr.sort((obj1, obj2) => obj1.value.NAME > obj2.value.NAME ? 1 : -1);

            else if (sortingMethod === 'Name Z to A')
                return newArr.sort((obj1, obj2) => obj1.value.NAME > obj2.value.NAME ? -1 : 1);

            else if (sortingMethod === 'Latest First')
                return newArr.sort((obj1, obj2) => obj1.value.DATE_CREATED > obj2.value.DATE_CREATED ? -1 : 1);

            else if (sortingMethod === 'Oldest First')
                return newArr.sort((obj1, obj2) => obj1.value.DATE_CREATED > obj2.value.DATE_CREATED ? 1 : -1);    
        }
    }
}
