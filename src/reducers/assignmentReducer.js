import * as types from '../actions/action_types.js';


let initialState = {
  subjects : [],
  completedAssignments: [],
  overdueAssignments: [],
  typesDict:{}
}
export default (state = initialState, action) => {
  let newSubjects, typesDict, newOverdue, newCompleted;
 switch (action.type) {

  case types.INITIALIZE_ASSIGNMENTS:
   return {
    ...state,
    subjects : action.payload.subjects
   }

   case types.UPDATE_ASSIGNMENT :
          console.log(action.payload)
         newSubjects = state.subjects.slice();
         for(let i = 0; i < newSubjects.length; i++) {
           let subject = newSubjects[i];
           if(subject.subject_id !== action.payload.subject_id) continue;//Skip unaltered subjects

           for(let j = 0; j < subject.assignments.length; j++) {
            let assignment = subject.assignments[j];
            if(assignment.task_id !== action.payload.assignment.task_id) continue;//Skip unaltered subjects
              subject.assignments.splice(j,1,action.payload.assignment)
            break;
           }
           break;
         }

     return {
      ...state,
      subjects : newSubjects
     }

   case types.UPDATE_SUBJECT :
    newSubjects = state.subjects.slice();
    for(let i = 0; i < newSubjects.length; i++) {
      let subject = newSubjects[i];
      if(subject.subject_id !== action.payload.subject.subject_id) continue;//Skip unaltered subjects

      newSubjects.slice(i,1,action.payload.subject)
      break;
    }
    return {
      ...state,
      subjects : newSubjects
    }

    case types.ADD_ASSIGNMENT :
      newSubjects = state.subjects.slice(); //copy the current subjects

      for(let i = 0; i < newSubjects.length; i++) {
        let subject = newSubjects[i];
        if(subject.subject_id !== action.payload.subject_id) continue;//Skip unaltered subjects

        subject.assignments.push(action.payload.assignment)//Add the new assignment
        break;
      }
      return {
        ...state,
        subjects:newSubjects,
      };

    case types.ADD_SUBJECT :
      newSubjects = state.subjects.slice(); //copy the current subjects
      console.log("Test")
      console.log(action.payload.subject)
      newSubjects.push(action.payload.subject); //add the new one
      

      return {
        ...state,
        subjects : newSubjects
      };

    case types.COMPLETE_ASSIGNMENT :
        return state;

    case types.SET_COMPLETED_ASSIGNMENTS:

      if(!action.payload.assignments) action.payload.assignments = [{name:'Something',subject:'something',dueDate:'2018-12-2',type:'Assignment'}]
      return {
        ...state,
        completedAssignments: action.payload.assignments
      }

    case types.SET_OVERDUE_ASSIGNMENTS:

      if(!action.payload.assignments) action.payload.assignments = [{name:'Something',subject:'something',dueDate:'2018-12-2',type:'Assignment'}]
      return {
        ...state,
        overdueAssignments: action.payload.assignments
      }

    case types.DELETE_TASK:
      console.log(action.payload)
      newSubjects = state.subjects;
      newOverdue = state.overdueAssignments;
      newCompleted = state.completedAssignments;

      if(action.payload.collection === 'SUBJECTS' || action.payload.collection === 'ALL') {
        newSubjects = state.subjects.slice(); //copy the current subjects
        for(let i = 0; i < newSubjects.length; i++) {
          let subject = newSubjects[i];
          if(action.payload.subject_id && subject.subject_id !== action.payload.subject_id) continue;//Skip unaltered subjects

          subject.assignments = subject.assignments.filter((value, index, arr) => {
            console.log(value.task_id+' '+action.payload.task_id);
            return value.task_id !== action.payload.task_id
          })
          console.log(subject.assignments)
        }
      }

      if(action.payload.collection === 'COMPLETED') {
        newCompleted = state.completedAssignments.slice(); //copy the current subjects
          newCompleted = newCompleted.filter((assignment, index, arr) => {
            return assignment.task_id !== action.payload.task_id
          })
      }

      if(action.payload.collection === 'OVERDUE' || action.payload.collection === 'ALL') {
        newOverdue = state.overdueAssignments.slice(); //copy the current subjects
          newOverdue = newOverdue.filter((assignment, index, arr) => {
            return assignment.task_id !== action.payload.task_id
          })
      }
      
      return {
        ...state,
        subjects:newSubjects,
        completedAssignments:newCompleted,
        overdueAssignments:newOverdue
      };

    case types.DELETE_SUBJECT:
      //Gets rid of one of the subjects
      newSubjects = state.subjects.filter((value, index, arr) => {
        return value.subject_id !== action.payload.subject_id;
      });

      return {
        ...state,
        subjects:newSubjects
      }

    case types.SET_TYPES:

     typesDict = {};
     let typesArr = action.payload.types;
     for(let i = 0; i < typesArr.length; i++) {
      typesDict[typesArr[i].type_id] = typesArr[i];
     }

     return {
       ...state,
       typesDict:typesDict
     }

    case types.ADD_TYPE:
      typesDict = Object.assign({}, state.typesDict)
      typesDict[action.payload.type.type_id] = action.payload.type;
      return {
        ...state,
        typesDict:typesDict
      }

    case types.UPDATE_TYPE:
      typesDict = Object.assign({}, state.typesDict)
      typesDict[action.payload.type.type_id] = action.payload.type;
      console.log(typesDict)
      return {
        ...state,
        typesDict:typesDict
      }

    case types.REMOVE_TYPE:
      typesDict = Object.assign({}, state.typesDict)
      delete typesDict[action.payload.type_id]
      console.log(action.payload.type_id);
      console.log(typesDict);
      return {
        ...state,
        typesDict:typesDict
      }

  default:
   return state
 }
}
