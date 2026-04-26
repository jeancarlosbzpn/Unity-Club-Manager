const PATHFINDER_HIERARCHY = ['friend', 'companion', 'explorer', 'ranger', 'voyager', 'guide', 'master_guide_candidate', 'master_guide_invested'];

const member = {
  membershipClass: 'companion',
  completedClasses: ['friend', 'companion', 'explorer', 'ranger', 'voyager', 'guide']
};

const itemClassIndex = PATHFINDER_HIERARCHY.indexOf('explorer'); // 2
const memberClassValue = member.membershipClass || member.pathfinderClass; // 'companion'
const memberClassIndex = PATHFINDER_HIERARCHY.indexOf(memberClassValue); // 1

let maxCompletedIndex = -1;
if (member.completedClasses && Array.isArray(member.completedClasses)) {
  const completedIndexes = member.completedClasses.map(c => PATHFINDER_HIERARCHY.indexOf(c));
  maxCompletedIndex = Math.max(-1, ...completedIndexes); // 5
}

console.log('maxCompletedIndex:', maxCompletedIndex);
console.log('memberClassIndex:', memberClassIndex);
console.log('itemClassIndex:', itemClassIndex);

let included = true;
let showInCurrentClass = false; // "Botón de explorador"

if (showInCurrentClass === false) {
  if (!(maxCompletedIndex >= itemClassIndex || memberClassIndex > itemClassIndex)) {
    included = false;
  }
} else {
  if (!(maxCompletedIndex >= itemClassIndex || memberClassIndex >= itemClassIndex)) {
    included = false;
  }
}

console.log('Included:', included);
